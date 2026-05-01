![ParseForge Banner](https://github.com/ParseForge/apify-assets/blob/ad35ccc13ddd068b9d6cba33f323962e39aed5b2/banner.jpg?raw=true)

# 🚀 Wellfound Jobs Scraper

> 🚀 **Pull startup jobs from Wellfound (formerly AngelList Talent).** Title, company, role, location. Camoufox + residential proxy bypasses DataDome.

> 🕒 **Last updated:** 2026-05-01 · **📊 7 fields** per job · **🚀 150,000+ startups** · **💼 multi-URL fanout** · **🛡️ DataDome bypass**

The **Wellfound Jobs Scraper** visits Wellfound (formerly AngelList Talent) using a Camoufox browser with residential proxy and returns startup jobs with job ID, title, company, location, salary, equity, remote type, and apply URL when surfaced. Multi-search-URL fanout reaches 100+ jobs across roles like engineer, PM, designer, and marketing.

Wellfound hosts more than 150,000 startups, making it the canonical job board for early-stage and high-growth tech roles. The site is gated by DataDome anti-bot. This Actor handles the bypass via warmup and DataDome iframe click, then walks multiple search URLs to aggregate job listings across roles.

| 🎯 Target Audience | 💡 Primary Use Cases |
|---|---|
| Recruiters, sourcers, job board builders, market analysts | Talent intel, startup mapping, salary benchmarking, hiring trends |

---

## 📋 What the Wellfound Jobs Scraper does

Three filtering workflows in a single run:

- 💼 **Multi-URL fanout.** Submit an array of Wellfound search URLs and the Actor visits each.
- 🛡️ **DataDome bypass.** Camoufox plus residential proxy plus Google warmup gets past the anti-bot challenge.
- 📜 **Scroll for more.** Per-page scrolling loads beyond the initial visible cards.

Each row reports the job ID (URL slug), full job URL, slug-decoded title, and any company, location, salary, or remote-type fields surfaced in the card markup.

> 💡 **Why it matters:** Wellfound is the early-stage tech job board. VCs, recruiters, and analysts use it to see who is hiring at high-growth startups. The site is hard to scrape directly because of DataDome. This Actor handles the bypass and the multi-URL fanout so you skip both the anti-bot work and the per-role URL juggling.

---

## 🎬 Full Demo

_🚧 Coming soon: a 3-minute walkthrough showing how to go from sign-up to a downloaded dataset._

---

## ⚙️ Input

<table>
<thead>
<tr><th>Input</th><th>Type</th><th>Default</th><th>Behavior</th></tr>
</thead>
<tbody>
<tr><td><code>maxItems</code></td><td>integer</td><td><code>10</code></td><td>Jobs to return. Free plan caps at 10, paid plan at 1,000,000.</td></tr>
<tr><td><code>searchUrls</code></td><td>array of strings</td><td>6 default Wellfound search URLs</td><td>Wellfound search URLs. The Actor visits each and aggregates jobs.</td></tr>
<tr><td><code>proxyConfiguration</code></td><td>object</td><td>Apify residential, US</td><td>Proxy used for the Camoufox session.</td></tr>
</tbody>
</table>

**Example: 100 jobs across the default 6 role pages.**

```json
{
    "maxItems": 100
}
```

**Example: only data-science roles.**

```json
{
    "maxItems": 50,
    "searchUrls": [
        "https://wellfound.com/role/data-scientist",
        "https://wellfound.com/role/machine-learning-engineer"
    ]
}
```

> ⚠️ **Good to Know:** the Actor uses Camoufox `headless: virtual` with US residential proxy. DataDome occasionally serves a hard captcha; in that case the Actor retries with a fresh proxy. Cold-start is around 30 seconds for the first profile, then 10-15 seconds per additional search URL.

---

## 📊 Output

Each job record contains **7 fields**. Download as CSV, Excel, JSON, or XML.

### 🧾 Schema

| Field | Type | Example |
|---|---|---|
| 🆔 `jobId` | string | `"4158185-video-editor-social-remote"` |
| 🔗 `url` | string | `"https://wellfound.com/jobs/4158185-video-editor-social-remote"` |
| 📰 `title` | string | `"Video Editor Social Remote"` |
| 🏢 `company` | string \| null | `"Acme Inc."` |
| 📍 `location` | string \| null | `"Remote"` |
| 💰 `salary` | string \| null | `"$70k-$90k"` |
| 🌐 `remote` | string \| null | `"Remote"` |
| 🕒 `scrapedAt` | ISO 8601 | `"2026-05-01T01:55:30.000Z"` |

### 📦 Sample records

<details>
<summary><strong>💼 Remote video-editor role with slug-decoded title</strong></summary>

```json
{
    "jobId": "4158185-video-editor-social-remote",
    "url": "https://wellfound.com/jobs/4158185-video-editor-social-remote",
    "title": "Video Editor Social Remote",
    "company": null,
    "location": null,
    "salary": null,
    "remote": null,
    "scrapedAt": "2026-05-01T01:55:30.000Z"
}
```

</details>

<details>
<summary><strong>🧠 Engineering role with company and location surfaced</strong></summary>

```json
{
    "jobId": "4158220-senior-software-engineer",
    "url": "https://wellfound.com/jobs/4158220-senior-software-engineer",
    "title": "Senior Software Engineer",
    "company": "Acme Inc.",
    "location": "San Francisco, CA",
    "salary": "$160k-$210k",
    "remote": "Hybrid"
}
```

</details>

<details>
<summary><strong>🎨 Design role from a multi-URL run</strong></summary>

```json
{
    "jobId": "4158311-product-designer-fintech",
    "url": "https://wellfound.com/jobs/4158311-product-designer-fintech",
    "title": "Product Designer Fintech",
    "company": "PayCo",
    "location": "New York",
    "remote": "Remote"
}
```

</details>

---

## ✨ Why choose this Actor

| | Capability |
|---|---|
| 🛡️ | **DataDome bypass.** Camoufox + residential proxy + warmup defeats the anti-bot challenge. |
| 💼 | **Multi-URL fanout.** Aggregate jobs across role and location pages in one run. |
| 🚀 | **Sub-2-minute runs.** A 100-job pull across 6 search URLs typically finishes in 90 to 100 seconds. |
| 🆔 | **Stable jobId.** URL slug works as a primary key across runs. |
| 📜 | **Slug-decoded title.** Title surfaced from the URL when card DOM is sparse. |
| 🌐 | **Country-routed proxy.** US residential by default, configurable to other countries. |
| 🦊 | **Camoufox headless: virtual.** Real browser fingerprint without a visible window. |

> 📊 In a single 96-second run the Actor returned 100 unique startup jobs across 6 Wellfound search URLs.

---

## 📈 How it compares to alternatives

| Approach | Cost | Coverage | Refresh | Filters | Setup |
|---|---|---|---|---|---|
| Direct HTTP scraping | Free | Blocked by DataDome | n/a | None | n/a |
| Manual Wellfound browsing | Free | One page at a time | Live | Built-in | Hours |
| Paid talent-intel platforms | $$$ subscription | Aggregated | Daily | Built-in | Account setup |
| **⭐ Wellfound Jobs Scraper** *(this Actor)* | Pay-per-event | Multi-URL fanout | Live | Search URL list | None |

Same job listings Wellfound serves to logged-out browsers, accessible via Camoufox session.

---

## 🚀 How to use

1. 🆓 **Create a free Apify account.** [Sign up here](https://console.apify.com/sign-up?fpr=vmoqkp) and get $5 in free credit.
2. 🔍 **Open the Actor.** Search for "Wellfound Jobs" in the Apify Store.
3. ⚙️ **Pick search URLs.** Default 6 role pages or supply your own.
4. ▶️ **Click Start.** A 100-job run typically completes in 90 to 120 seconds.
5. 📥 **Download.** Export as CSV, Excel, JSON, or XML.

> ⏱️ Total time from sign-up to first dataset: under five minutes.

---

## 💼 Business use cases

<table>
<tr>
<td width="50%">

### 👥 Recruiting & sourcing
- Build candidate pipelines from active startup hires
- Identify hot startups by hiring velocity
- Source by role-specific search URLs
- Track which startups are open to remote

</td>
<td width="50%">

### 📊 Market intelligence
- Map hiring across the early-stage ecosystem
- Salary benchmarking for startup roles
- Track remote-policy mix per role category
- Spot funded-startup hiring spikes early

</td>
</tr>
<tr>
<td width="50%">

### 🌐 Job aggregation
- Power vertical job boards focused on startups
- Build remote-first niche job feeds
- Surface YC-stage company openings
- Drive Slack alerts for new role posts

</td>
<td width="50%">

### 📰 Content & SEO
- Publish "X startups hiring now" posts with real data
- Track open positions per company over time
- Build interactive startup-hiring dashboards
- Cite real openings with stable URLs

</td>
</tr>
</table>

---

## 🌟 Beyond business use cases

Data like this powers more than commercial workflows. The same structured records support research, education, civic projects, and personal initiatives.

<table>
<tr>
<td width="50%">

### 🎓 Research and academia
- Empirical datasets for papers, thesis work, and coursework
- Longitudinal studies tracking changes across snapshots
- Reproducible research with cited, versioned data pulls
- Classroom exercises on data analysis and ethical scraping

</td>
<td width="50%">

### 🎨 Personal and creative
- Side projects, portfolio demos, and indie app launches
- Data visualizations, dashboards, and infographics
- Content research for bloggers, YouTubers, and podcasters
- Hobbyist collections and personal trackers

</td>
</tr>
<tr>
<td width="50%">

### 🤝 Non-profit and civic
- Transparency reporting and accountability projects
- Advocacy campaigns backed by public-interest data
- Community-run databases for local issues
- Investigative journalism on public records

</td>
<td width="50%">

### 🧪 Experimentation
- Prototype AI and machine-learning pipelines with real data
- Validate product-market hypotheses before engineering spend
- Train small domain-specific models on niche corpora
- Test dashboard concepts with live input

</td>
</tr>
</table>

---

## 🔌 Automating Wellfound Jobs Scraper

Run this Actor on a schedule, from your codebase, or inside another tool:

- **Node.js** SDK: see [Apify JavaScript client](https://docs.apify.com/api/client/js/) for programmatic runs.
- **Python** SDK: see [Apify Python client](https://docs.apify.com/api/client/python/) for the same flow in Python.
- **HTTP API**: see [Apify API docs](https://docs.apify.com/api/v2) for raw REST integration.

Schedule daily runs from the Apify Console to track new openings. Pipe results into your ATS, Google Sheets, S3, BigQuery, or your own webhook with the built-in [integrations](https://docs.apify.com/platform/integrations).

---

## ❓ Frequently Asked Questions

<details>
<summary><strong>🔗 What URL formats does searchUrls accept?</strong></summary>

Any Wellfound search URL: `wellfound.com/jobs`, `/role/{role}`, `/location/{city}`, or specific filtered URLs. The Actor visits each and aggregates results across them.

</details>

<details>
<summary><strong>🛡️ Why does this need Camoufox?</strong></summary>

Wellfound deploys DataDome on every page request. DataDome fingerprints TLS and JS-runtime APIs, blocking standard `fetch` and Playwright Chromium. Camoufox is built specifically to defeat that detection.

</details>

<details>
<summary><strong>📜 Why is the title sometimes slug-decoded?</strong></summary>

Wellfound A/B-tests their card markup, and the title selector occasionally returns empty. The Actor falls back to slug-decoded title in that case so every row has a usable title.

</details>

<details>
<summary><strong>💰 Why are salary and company sometimes null?</strong></summary>

Card-level markup on Wellfound depends on the company's posting choices and current A/B-test variant. Per-job detail-page extraction is on the roadmap to fill these in for every record.

</details>

<details>
<summary><strong>📦 How many jobs can I pull per run?</strong></summary>

Free plan caps at 10. Paid plans up to 1,000,000. Per-run, multi-URL fanout reaches 100+ jobs typically.

</details>

<details>
<summary><strong>🌍 Can I target a specific country?</strong></summary>

Yes via the proxy configuration. Default is US residential. Pass a different `apifyProxyCountry` to route through that country's IPs.

</details>

<details>
<summary><strong>🛡️ What happens when DataDome challenges?</strong></summary>

The Actor detects the iframe, clicks the centroid, and waits up to 35 seconds for the challenge to clear. Soft challenges clear automatically; hard captchas trigger a retry with a fresh proxy session.

</details>

<details>
<summary><strong>💼 Can I use this for commercial work?</strong></summary>

Yes for permissible purposes. The Actor reads only public job listings Wellfound serves to any logged-out browser. Always honor Wellfound's terms when republishing content.

</details>

<details>
<summary><strong>💳 Do I need a paid Apify plan?</strong></summary>

The free plan returns up to 10 jobs per run. Paid plans return up to 1,000,000.

</details>

<details>
<summary><strong>⚠️ What if a run returns far fewer jobs than expected?</strong></summary>

DataDome may have served a hard captcha mid-run. Retry once. If the issue persists, [open a contact form](https://tally.so/r/BzdKgA) and include the run URL.

</details>

<details>
<summary><strong>🔁 How fresh is the data?</strong></summary>

Live. Each run hits Wellfound at run time.

</details>

<details>
<summary><strong>⚖️ Is this legal?</strong></summary>

The Actor reads only what Wellfound publicly serves to logged-out browser visitors. Always verify your specific use case complies with Wellfound's terms and your local law.

</details>

---

## 🔌 Integrate with any app

- [**Make**](https://apify.com/integrations/make) - drop run results into 1,800+ apps.
- [**Zapier**](https://apify.com/integrations/zapier) - trigger automations off completed runs.
- [**Slack**](https://apify.com/integrations/slack) - post run summaries to a channel.
- [**Google Sheets**](https://apify.com/integrations/google-sheets) - sync each run into a spreadsheet.
- [**Webhooks**](https://docs.apify.com/platform/integrations/webhooks) - notify your own services on run finish.
- [**Airbyte**](https://apify.com/integrations/airbyte) - load runs into Snowflake, BigQuery, or Postgres.

---

## 🔗 Recommended Actors

- [**💼 Lever Jobs Scraper**](https://apify.com/parseforge/lever-jobs-scraper) - the same workflow for Lever ATS-hosted boards.
- [**🐙 GitHub Trending Repos Scraper**](https://apify.com/parseforge/github-trending-scraper) - identify trending tech stacks the startups are hiring for.
- [**💬 Stack Exchange Q&A Scraper**](https://apify.com/parseforge/stack-exchange-qa-scraper) - cross-reference roles with developer Q&A activity.
- [**🅱️ Bing Search Scraper**](https://apify.com/parseforge/bing-search-scraper) - run open-web searches on companies you find.
- [**🦆 DuckDuckGo Search Scraper**](https://apify.com/parseforge/duckduckgo-search-scraper) - alternative SERP signal alongside startup hiring data.

> 💡 **Pro Tip:** browse the complete [ParseForge collection](https://apify.com/parseforge) for more pre-built scrapers and data tools.

---

**🆘 Need Help?** [**Open our contact form**](https://tally.so/r/BzdKgA) and we'll route the question to the right person.

---

> Wellfound and AngelList are registered trademarks of their respective owners. This Actor is not affiliated with or endorsed by Wellfound. It reads only public job listings every logged-out browser can access.
