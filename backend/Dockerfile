# Hardened: small Alpine base, patched OS packages, no npm in the final image,
# production deps only, runs as the unprivileged "node" user.
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app

RUN apk upgrade --no-cache

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# npm is only needed to install; removing it drops its bundled dependencies
# from the image (and from the Trivy report)
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --chown=node:node . .

USER node
EXPOSE 5000
CMD ["node", "server.js"]
