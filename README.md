# DISASTER SCOPE

「現実の街を、3Dで守る。」— 防災について学び、検討するための3Dデジタルツイン開発プレビューです。

> **重要:** 現在のアプリは仮想データのデモです。宇和島市の標高・建物・道路・洪水・避難場所の公的データは含まず、実際の災害や避難経路の安全性を予測しません。

## 起動方法

```powershell
cd frontend
npm install
npm run dev
```

型チェックと本番ビルド:

```powershell
npm run build
npm run test
npm run lint
```

## GitHub Pagesへのデプロイ

ビルド済みサイトは `gh-pages` ブランチに配置します。公開を有効にするには、GitHubリポジトリの **Settings → Pages → Build and deployment** で、Sourceを **Deploy from a branch**、Branchを **gh-pages**、フォルダーを **/(root)** に設定してください。

設定後、サイトは <https://harumiya0110-lab.github.io/bousai/> で公開されます。新しい版を公開するときは、`VITE_BASE_PATH=/bousai/` を指定して `frontend` をビルドし、生成した `frontend/dist` の内容を `gh-pages` ブランチのルートへ反映します。通常のローカル開発・プレビューではルートパスを使用します。

## 現在の実装範囲

- 日本語のホーム、画面ナビゲーション、データ接続状態。
- 仮想地形を使ったReact Three Fiber/Three.jsの3Dシーン。回転・パン・ズーム、視点プリセット、建物・河川・道路・仮想施設レイヤ切替。
- 仮想洪水表示の段階操作。実際の浸水予測と誤認しない説明を表示。
- 仮想防災施設の追加・移動・削除、ローカル保存、JSONダウンロード。
- データ未取得の分析・避難分析画面は未実装と明示し、架空の統計や道路経路を表示しない。

## ドキュメント

- [開発計画と進捗](./docs/DEVELOPMENT_PLAN.md)
- [アーキテクチャ](./docs/ARCHITECTURE.md)
- [ユーザーガイド](./docs/USER_GUIDE.md)
- [データ出典と利用条件](./docs/DATA_SOURCES.md)
- [安全性と制限事項](./docs/SAFETY_AND_LIMITATIONS.md)

## 技術構成

React 19、TypeScript、Vite、React Three Fiber、Three.js、Drei、Zustand、Vitest。実データ連携、座標変換、GeoJSON検証、経路探索等は今後の実装フェーズです。

## プロジェクト構成

- `frontend/` — Webアプリ
- `docs/` — 計画、データソース、安全上の制限
