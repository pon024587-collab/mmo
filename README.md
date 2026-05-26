# Medieval Life Simulator

中世剣と魔法の生活シミュレーターゲーム。現実時間と完全同期したリアルタイムの世界で生活を営む。

## 起動方法

### 必要なもの
- Docker Desktop
- Node.js 20+
- pnpm 9+

### 手順

```bash
# 依存関係インストール
pnpm install

# Docker起動（PostgreSQL + Redis + バックエンド + フロントエンド）
docker compose up

# または個別起動
# DBマイグレーション
pnpm migrate

# バックエンド開発サーバー（別ターミナル）
cd packages/backend && pnpm dev

# フロントエンド開発サーバー（別ターミナル）
cd packages/frontend && pnpm dev
```

### アクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:4000
- ヘルスチェック: http://localhost:4000/health

## テスト実行

```bash
cd packages/backend && pnpm test
```

## 主な機能

- **現実時間同期**: 現実1時間 = ゲーム内1日
- **行動システム**: 農業・戦闘・採集・魔法など全行動がリアルタイムでバックグラウンド進行
- **生存システム**: 空腹・水分・疲労・体温・ストレスの管理
- **スキル成長**: 数値非表示、テキストの変化で成長を表現
- **世界の動き**: 外交・戦争・天災・疫病・噂の伝播
- **一度きりの人生**: 死亡すると人生記録と墓が残り、転生して新しい人生を始める
