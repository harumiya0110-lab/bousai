# アーキテクチャ（開発プレビュー）

## 構成

- frontend/src/App.tsx: 日本語ホーム、ナビゲーション、画面状態、実験レポート表示・出力。
- frontend/src/components/SimulationPage.tsx: 3D画面のレイヤ・選択詳細・仮想シナリオ・実験操作。
- frontend/src/components/Scene3D.tsx: React Three FiberのCanvas、地形/建物/道路/河川/マーカーの描画、カメラ制御。
- frontend/src/data/demo.ts: 区分Bの仮想地形・建物モデルの生成、デモレイヤとデータ型。
- frontend/src/data/reports.ts: 仮想実験レポートの形式検証、localStorageへの保存、JSON出力用データURL。
- frontend/src/store.ts: Zustandでレイヤ、選択状態、ツールモード、仮想施設を保持。
- docs/: 開発状況、データ出典、利用者ガイド、安全上の制限事項。

## 座標とデータ境界

3Dシーンのx,zは視覚化用のローカル座標（単位なし）です。経緯度、測量座標、距離や標高の実測値として使用していません。A（公的実データ）とB（仮想シミュレーション）とC（推定・補助データ）は混在させず、データ源を確認する前にCRSを推測しません。

現在、公的データを自動取得する処理はありません。地域ごとの実測DEM/GMLパーサー、座標変換、MapLibre 2D同期は未実装です。これらは実データの利用条件と形式を確認してから追加します。

## 描画と性能

- 地形は決定的な教育用関数から生成した三角形メッシュです。実測DEMではありません。
- 建物表示はInstancedMeshを用いた仮想モデルです。
- 3D画面とScene3Dモジュールは遅延読込し、依存ライブラリはサイズ上限を設けて分割しています。

## 地理データワークスペース（GeoJSON取込）

- frontend/src/components/DataStudioPage.tsx: GeoJSONファイルの読み込み、出典・ライセンス情報の入力、一覧・削除・エクスポート。
- frontend/src/data/geojson.ts: GeoJSON構造、WGS84経度緯度、座標数、地物数、範囲の検証と集計。
- frontend/src/data/geoStore.ts: IndexedDBへのレイヤ保存。データ変更時はカスタムイベントで3D画面へ通知。
- frontend/src/components/GeoLayers3D.tsx: 登録したPoint / LineString / Polygon等をローカルシーンの相対縮尺平面へ描画。
- SimulationPage.tsxは保存済みレイヤを読み込み、利用者がインポートレイヤを個別に表示・非表示できる。

### 取込データの制約

- RFC7946互換のOGC:CRS84 / WGS84経度・緯度を対象とする。未対応CRSを自動推測・自動変換しない。
- ファイル上限20MB、合計保存上限100MB、地物上限50,000件、座標上限500,000点。
- 3Dプレビューは各レイヤ最大2,500地物、点8,000件、線500本、面500件、線の頂点1,200点、面リング600点に制限する。上限を超えた部分はプレビュー対象外だが、IndexedDB内の元データは変更しない。
- 表示座標は対象範囲に合わせて正規化した相対縮尺であり、メートル単位の測量縮尺ではない。
- DEMを地表面へドレープしていないため、読み込んだ面・線は平面上に表示する。実測標高や実際の地形との一致を意味しない。
- 出典、利用規約、ライセンスの真正性は自動検証しない。登録者が確認する必要がある。


## CSV取込

- \`frontend/src/data/csv.ts\`: BOM付きUTF-8、CRLF、引用符内カンマ/改行に対応するCSVパーサー、経度・緯度列の候補検出、座標列の選択に基づくPoint GeoJSON変換。
- \`frontend/src/data/csv.test.ts\`: CSV構文、座標列検出、GeoJSON変換、欠損・範囲外座標行の除外、引用符エラーのテスト。
- 座標系はCSVの列名から推測しない。利用者が元データの仕様を確認した旨をチェックしてから変換を実行する。
- CSVの元ファイルはIndexedDBへ保存しない。変換後のポイントGeoJSONと属性を保存するため、元CSVは利用者が別途保管する。
