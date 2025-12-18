# build stage (has dev deps & tooling)
FROM node:22-alpine AS builder
WORKDIR /app

# copy package files first for cached installs
COPY package*.json ./

# install all deps for build (deterministic)
RUN npm ci

# copy source (don't copy .env here)
COPY . .

# run DB generation + build
RUN npm run db:generate
RUN npm run build

# remove dev deps, keep only production modules
RUN npm prune --production

# runtime stage (small)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# copy only what is needed at runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# use node to run built bundle — update path to your actual entry file
CMD ["node", "dist/server.js"]