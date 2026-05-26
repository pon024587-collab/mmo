FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

# モノレポのルートからコピー（tsconfig.base.jsonを含む）
COPY package.json pnpm-workspace.yaml ./
COPY packages/frontend/package.json ./packages/frontend/
RUN pnpm install --filter frontend

COPY packages/frontend/ ./packages/frontend/

WORKDIR /app/packages/frontend
EXPOSE 3000
CMD ["pnpm", "dev", "--host"]
