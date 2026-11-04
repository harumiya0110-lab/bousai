# アーキテクチャ（初期プレビュー）

## 構成

- `frontend/src/App.tsx`: 日本語ホーム、ナビゲーション、画面状態、実験レポート表示・出力。
- `frontend/src/components/SimulationPage.tsx`: 3D画面のレイヤ・選択詳細・仮想シナリオ・実験操作。
- `frontend/src/components/Scene3D.tsx`: React Three FiberのCanvas、地形/建物/道路/河川/マーカーの描画、カメラ制御。
- `frontend/src/data/demo.ts`: 区分Bの仮想地形・建物モデルの生成、デモレイヤとデータ型。
- `frontend/src/data/reports.ts`: 仮想実験レポートの形式検証、localStorageへの保存、JSON出力用データURL。
- `frontend/src/store.ts`: Zustandでレイヤ、選択状態、ツールモード、仮想施設を保持。
- `docs/`: 開発状況、データ出典、利用者ガイド、安全上の制限事項。

## 座標とデータ境界

3Dシーンの`x,z`は視覚化用のローカル座標（単位なし）です。経緯度、測量座標、距離や標高の実測値として使用していません。A（公的実データ）とB（仮想シミュレーション）とC（推定・補助データ）は混在させず、データ源を確認する前にCRSを推測しません。

現在は外部データを自動取得しません。地域ごとのデータmanifest、DEM/GML/GeoJSONパーサー、座標変換、MapLibre 2D同期は未実装です。これらは実データの利用条件と形式を確認してから追加します。

## 描画と性能

- 地形は決定的な教育用関数から生成した三角形メッシュです。実測DEMではありません。
- 建物表示は`InstancedMesh`を用いた仮想モデルです。
- 3D画面とScene3Dモジュールは遅延読込し、依存ライブラリはサイズ上限を設けて分割しています。
- GeoJSON、テクスチャ、地理レイヤ、LOD、Web Workerは未導入です。
