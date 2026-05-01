import { Actor, log } from 'apify';
import c from 'chalk';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Camoufox } = require('camoufox');

interface Input {
    maxItems?: number;
    searchUrl?: string;
    proxyConfiguration?: any;
}

const STARTUP = ['💼 Pulling Wellfound jobs…', '🚀 Crawling startup talent…', '📋 Reading the latest postings…'];
const DONE = ['🎉 Wellfound jobs delivered.', '✅ Postings ready.', '🚀 Talent feed captured.'];
const pick = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

await Actor.init();
const input = (await Actor.getInput<Input>()) ?? {};
const userIsPaying = Boolean(Actor.getEnv()?.userIsPaying);
const isPayPerEvent = Actor.getChargingManager().getPricingInfo().isPayPerEvent;

let effectiveMaxItems = input.maxItems ?? 10;
if (!userIsPaying) {
    if (!effectiveMaxItems || effectiveMaxItems > 10) {
        effectiveMaxItems = 10;
        log.warning([
            '',
            `${c.dim('        *  .  ✦        .    *       .')}`,
            `${c.dim('  .        *')}    🛰️  ${c.dim('.        *   .    ✦')}`,
            `${c.dim('     ✦  .        .       *        .')}`,
            '',
            `${c.yellow("  You're on a free plan — limited to 10 items.")}`,
            `${c.cyan('  Upgrade to a paid plan for up to 1,000,000 items.')}`,
            '',
            `  ✦ ${c.green.underline('https://console.apify.com/sign-up?fpr=vmoqkp')}`,
            '',
        ].join('\n'));
    }
}

const searchUrl = (input.searchUrl ?? 'https://wellfound.com/jobs').trim();

console.log(c.cyan('\n🛰️  Arguments:'));
console.log(c.green(`   🟩 searchUrl : ${searchUrl}`));
console.log(c.green(`   🟩 maxItems : ${effectiveMaxItems}`));
console.log('');
console.log(c.magenta(`📬 ${pick(STARTUP)}\n`));

const proxy = await Actor.createProxyConfiguration(input.proxyConfiguration ?? {
    useApifyProxy: true,
    apifyProxyGroups: ['RESIDENTIAL'],
    apifyProxyCountry: 'US',
});
const proxyUrl = proxy ? await proxy.newUrl(`session_${Date.now()}`) : undefined;

log.info('🦊 Spawning Camoufox…');
const browser = await Camoufox({
    headless: 'virtual',
    proxy: proxyUrl ? { server: proxyUrl } : undefined,
    humanize: true,
    geoip: true,
});
const context = browser.contexts?.()[0] || browser;
const page = context.pages?.()[0] || (await browser.newPage());

async function handleDataDome(): Promise<boolean> {
    const dd = await page.$('iframe[src*="captcha-delivery.com"]').catch(() => null);
    if (!dd) return false;
    log.info('   🛡️ DataDome iframe detected, clicking…');
    try {
        const box = await dd.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 2 - 5, box.y + box.height / 2 - 5);
            await sleep(400);
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            log.info('   ⏳ Waiting up to 35s for challenge to clear…');
            for (let i = 0; i < 35; i++) {
                await sleep(1000);
                const stillDD = await page.$('iframe[src*="captcha-delivery.com"]').catch(() => null);
                if (!stillDD) return true;
            }
        }
    } catch (e: any) {
        log.warning(`   DataDome click failed: ${e.message}`);
    }
    return false;
}

async function warmupAndNavigate(): Promise<boolean> {
    try {
        log.info('🌐 Warmup: google.com');
        await page.goto('https://www.google.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(2000);

        log.info('🌐 Warmup: wellfound.com homepage');
        await page.goto('https://wellfound.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
        await sleep(3000);
        await handleDataDome();

        log.info(`📡 ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await sleep(3000);
        await handleDataDome();
        return true;
    } catch (e: any) {
        log.warning(`Navigation: ${e.message}`);
        return false;
    }
}

let pushed = 0;
try {
    const ok = await warmupAndNavigate();
    if (!ok) throw new Error('Failed to navigate past DataDome');

    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    const jobs = await page.evaluate(() => {
        const out: any[] = [];
        const cards = document.querySelectorAll('[data-test="JobSearchCard"], [class*="JobCard"], [class*="job-listing"], a[href*="/jobs/"]');
        const seen = new Set<string>();
        cards.forEach((card) => {
            const link = (card as HTMLElement).querySelector('a[href*="/jobs/"]') ?? card;
            const href = (link as HTMLAnchorElement)?.href ?? '';
            if (!href || seen.has(href)) return;
            seen.add(href);
            const title = (card as HTMLElement).querySelector('h3, h2, [class*="title"]')?.textContent?.trim() ?? null;
            const company = (card as HTMLElement).querySelector('[class*="company"], [class*="startup"]')?.textContent?.trim() ?? null;
            const location = (card as HTMLElement).querySelector('[class*="location"]')?.textContent?.trim() ?? null;
            const salary = (card as HTMLElement).querySelector('[class*="salary"], [class*="compensation"]')?.textContent?.trim() ?? null;
            const remote = (card as HTMLElement).querySelector('[class*="remote"]')?.textContent?.trim() ?? null;
            out.push({ url: href, title, company, location, salary, remote });
        });
        return out;
    });

    log.info(`📊 ${jobs.length} jobs found on page`);

    for (const job of jobs) {
        if (pushed >= effectiveMaxItems) break;
        const slug = job.url.split('/jobs/')[1]?.split('?')[0] ?? null;
        const record = {
            jobId: slug,
            url: job.url,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            remote: job.remote,
            scrapedAt: new Date().toISOString(),
        };
        if (isPayPerEvent) await Actor.pushData([record], 'result-item');
        else await Actor.pushData([record]);
        pushed += 1;
    }
} catch (err: any) {
    log.error(`❌ ${err.message}`);
    await Actor.pushData([{ error: err.message }]);
}

try { await browser.close(); } catch {}

if (pushed === 0) await Actor.pushData([{ error: 'No jobs extracted. DataDome challenge may not have cleared.' }]);
log.info(c.green(`✅ Pushed ${pushed} jobs`));
console.log(c.magenta(`\n${pick(DONE)}`));
await Actor.exit();
