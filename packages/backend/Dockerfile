FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

# モノレポのルートからコピー
COPY package.json pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --filter backend

COPY packages/backend/ ./packages/backend/

WORKDIR /app/packages/backend
EXPOSE 4000
CMD ["pnpm", "dev"]
