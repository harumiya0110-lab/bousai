# DISASTER SCOPE

「現実の街を、3Dで守る。」— 防災について学び、検討するための3Dデジタルツイン開発プレビューです。

> **重要:** 初期の3D地形・建物・道路・河川・洪水・避難場所は仮想データです。宇和島市の公的データを標準同梱しておらず、実際の災害や避難経路の安全性を予測しません。利用者がGeoJSON/CSVを取り込んだ場合も、出典・座標系・内容の正しさは利用者自身で確認してください。

## 起動方法

    cd frontend
    npm install
    npm run dev

型チェックと本番ビルド:

    npm run build
    npm run test
    npm run lint

## GitHub Pagesへのデプロイ

ビルド済みサイトは gh-pages ブランチに配置します。公開を有効にするには、GitHubリポジトリの Settings → Pages → Build and deployment で、Sourceを Deploy from a branch、Branchを gh-pages、フォルダーを /(root) に設定してください。

設定後、サイトは https://harumiya0110-lab.github.io/bousai/ で公開されます。新しい版を公開するときは、VITE_BASE_PATH=/bousai/ を指定して frontend をビルドし、生成した frontend/dist の内容を gh-pages ブランチのルートへ反映します。通常のローカル開発・プレビューではルートパスを使用します。

## 現在の実装範囲

- 日本語のホーム、画面ナビゲーション、データ接続状態。
- 仮想地形を使ったReact Three Fiber/Three.jsの3Dシーン。回転・パン・ズーム、視点プリセット、建物・河川・道路・仮想施設レイヤ切替。
- 仮想洪水表示の段階操作。実際の浸水予測と誤認しない説明を表示。
- 仮想防災施設の追加・移動・削除、ローカル保存、JSONダウンロード。
- 地理データ管理画面で、GeoJSONの構造検証とCSVからポイントGeoJSONへの変換に対応。CSVは経度・緯度の列を選択し、WGS84/OGC:CRS84であることを確認してから登録する。データはIndexedDBに保存し、外部サーバーへ送信しない。各ファイル20 MB・合計100 MBの保存上限を設定。
- 宇和島市が公開する指定緊急避難場所CSV（2024-04-01更新、CC BY 4.0）と雨水出水浸水想定区域の公式案内ページをデータ管理画面から参照できる。CSV本体をアプリに同梱・自動取得しているわけではない。
- 登録したGeoJSONは3Dシミュレーション上で相対縮尺の平面レイヤとして表示できる。大容量レイヤは描画件数・頂点数を制限し、元データは保持する。
- データ未取得の分析・避難分析画面は未実装と明示し、架空の統計や道路経路を表示しない。

## ドキュメント

- 開発計画と進捗: docs/DEVELOPMENT_PLAN.md
- アーキテクチャ: docs/ARCHITECTURE.md
- ユーザーガイド: docs/USER_GUIDE.md
- データ出典と利用条件: docs/DATA_SOURCES.md
- 宇和島市の公開データ調査: docs/UWAJIMA_DATASETS.md
- 安全性と制限事項: docs/SAFETY_AND_LIMITATIONS.md

## 技術構成

React 19、TypeScript、Vite、React Three Fiber、Three.js、Drei、Zustand、Vitest。GeoJSONのローカル取込・構造検証、CSVの座標列マッピング、相対縮尺3D表示に対応しています。公的データの自動取得、JGD2011/JGD2024等の座標変換、実測DEMの地形化、道路経路探索は未実装です。

## プロジェクト構成

- frontend/ — Webアプリ
- docs/ — 計画、データソース、安全上の制限
