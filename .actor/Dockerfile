FROM apify/actor-node-playwright-camoufox:22

COPY package*.json ./
RUN npm --quiet set progress=false && npm install --include=dev && echo "NPM install done"
COPY . ./
RUN npm run build && npm prune --omit=dev
CMD npm start --silent
