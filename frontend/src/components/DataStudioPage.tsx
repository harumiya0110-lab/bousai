import { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react'
import {
  AlertCircle, ArrowDownToLine, CheckCircle2, Database, FileJson, FileUp, Info,
  Layers3, Link2, MapPin, RefreshCw, ShieldAlert, Trash2, Upload,
} from 'lucide-react'
import { deleteGeoLayer, listGeoLayers, saveGeoLayer } from '../data/geoStore'
import { csvToGeoJson, decodeCsvBytes, detectCoordinateColumns, parseCsvText, type CsvEncoding, type CsvTable } from '../data/csv'
import {
  formatByteSize, GEO_CATEGORY_LABELS, MAX_GEOJSON_BYTES, MAX_TOTAL_GEOJSON_BYTES, parseGeoJsonText,
  type GeoJsonSummary, type GeoLayerCategory, type GeoLayerRecord,
} from '../data/geojson'
import './DataStudioPage.css'

const categories: GeoLayerCategory[] = ['flood', 'shelters', 'roads', 'buildings', 'other']

export function DataStudioPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [layers, setLayers] = useState<GeoLayerRecord[]>([])
  const [parsed, setParsed] = useState<GeoJsonSummary | null>(null)
  const [csvTable, setCsvTable] = useState<CsvTable | null>(null)
  const [csvLongitudeColumn, setCsvLongitudeColumn] = useState('')
  const [csvLatitudeColumn, setCsvLatitudeColumn] = useState('')
  const [csvCrsReviewed, setCsvCrsReviewed] = useState(false)
  const [csvSkippedRows, setCsvSkippedRows] = useState(0)
  const [csvEncoding, setCsvEncoding] = useState<CsvEncoding>('UTF-8')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [layerName, setLayerName] = useState('')
  const [category, setCategory] = useState<GeoLayerCategory>('flood')
  const [sourceName, setSourceName] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [dataUpdatedAt, setDataUpdatedAt] = useState('')
  const [licenseNote, setLicenseNote] = useState('')
  const [licenseReviewed, setLicenseReviewed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState(false)

  const refreshLayers = useCallback(async () => {
    try {
      setLayers(await listGeoLayers())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '保存済みレイヤを読み込めませんでした。')
    }
  }, [])

  useEffect(() => { void refreshLayers() }, [refreshLayers])

  const handleFile = async (file?: File) => {
    if (!file) return
    setError('')
    setNotice('')
    setParsed(null)
    setCsvTable(null)
    setCsvCrsReviewed(false)
    setCsvSkippedRows(0)
    setCsvLongitudeColumn('')
    setCsvLatitudeColumn('')
    setCsvEncoding('UTF-8')
    setSourceName('')
    setSourceUrl('')
    setDataUpdatedAt('')
    setLicenseNote('')
    setLicenseReviewed(false)
    if (file.size > MAX_GEOJSON_BYTES) {
      setError('ファイルが大きすぎます。上限は ' + formatByteSize(MAX_GEOJSON_BYTES) + ' です。')
      return
    }
    if (!/\.(geojson|json|csv)$/i.test(file.name)) {
      setError('GeoJSON（.geojson / .json）またはCSVファイルを選択してください。')
      return
    }
    setBusy(true)
    try {
      const fileBytes = await file.arrayBuffer()
      setFileName(file.name)
      setFileSize(file.size)
      setLayerName(file.name.replace(/\.(geojson|json|csv)$/i, ''))

      if (/\.csv$/i.test(file.name)) {
        const decoded = decodeCsvBytes(fileBytes)
        const table = parseCsvText(decoded.text)
        const detected = detectCoordinateColumns(table.headers)
        setCsvEncoding(decoded.encoding)
        setCsvTable(table)
        setCsvLongitudeColumn(detected.longitudeColumn)
        setCsvLatitudeColumn(detected.latitudeColumn)
        const isEmergencyPlaceCsv = /382035_evacuation_space|指定緊急避難場所/i.test(file.name)
        const isDesignatedShelterCsv = /55417|shiteihinanbasyo|指定避難所|指定避難場所/i.test(file.name)
        const isTsunamiBuildingCsv = /tsunamihinanbiru|津波避難ビル/i.test(file.name)
        setCategory(isEmergencyPlaceCsv || isDesignatedShelterCsv || isTsunamiBuildingCsv ? 'shelters' : 'other')
        if (isEmergencyPlaceCsv) {
          setSourceName('宇和島市（危機管理課）')
          setSourceUrl('https://www.city.uwajima.ehime.jp/site/opendata-catalog/evacuation-space.html')
          setDataUpdatedAt('2024-04-01')
          setLicenseNote('CC BY 4.0 / 指定緊急避難場所')
        } else if (isDesignatedShelterCsv) {
          setSourceName('宇和島市（危機管理課）')
          setSourceUrl('https://www.city.uwajima.ehime.jp/site/opendata-catalog/shiteihinanbasyo.html')
          setDataUpdatedAt('2024-04-01')
          setLicenseNote('CC BY 4.0 / 指定避難所')
        } else if (isTsunamiBuildingCsv) {
          setSourceName('宇和島市（危機管理課）')
          setSourceUrl('https://www.city.uwajima.ehime.jp/site/opendata-catalog/tsunamihinanbiru.html')
          setDataUpdatedAt('2024-04-01')
          setLicenseNote('CC BY 4.0 / 津波避難ビル')
        }
        setNotice('CSVを読み込みました。経度・緯度の列と座標系を確認してください。')
      } else {
        const summary = parseGeoJsonText(new TextDecoder('utf-8').decode(fileBytes))
        setParsed(summary)
        setNotice('GeoJSONを検証しました。出典と利用条件を確認してから登録してください。')
      }
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'ファイルを読み込めませんでした。')
    } finally {
      setBusy(false)
    }
  }

  const previewCsv = () => {
    if (!csvTable) return
    if (!csvCrsReviewed) {
      setError('CSVの座標がWGS84（経度・緯度）であることを、元データの仕様で確認してください。')
      return
    }
    try {
      const converted = csvToGeoJson(csvTable, csvLongitudeColumn, csvLatitudeColumn)
      setParsed(parseGeoJsonText(JSON.stringify(converted.collection)))
      setCsvSkippedRows(converted.skippedRows)
      setNotice(
        converted.importedRows.toLocaleString('ja-JP') + '件を地図用ポイントへ変換しました。'
        + (converted.skippedRows > 0 ? ' 座標が欠損・範囲外の' + converted.skippedRows + '行は除外しました。' : ''),
      )
      setError('')
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'CSVを変換できませんでした。')
    }
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    void handleFile(event.dataTransfer.files?.[0])
  }

  const saveLayer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!parsed || !fileName) return
    if (sourceUrl.trim()) {
      try {
        const url = new URL(sourceUrl.trim())
        if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
      } catch {
        setError('出典URLは http:// または https:// で始まる有効なURLを入力してください。')
        return
      }
    }

    setBusy(true)
    setError('')
    try {
      const importedAt = new Date().toISOString()
      const record: GeoLayerRecord = {
        id: crypto.randomUUID(),
        name: layerName.trim() || fileName,
        category,
        sourceName: sourceName.trim() || '出典未入力',
        sourceUrl: sourceUrl.trim(),
        acquiredAt: importedAt,
        dataUpdatedAt,
        licenseNote: licenseNote.trim() || '利用条件未確認',
        licenseReviewed,
        fileName,
        byteSize: new TextEncoder().encode(JSON.stringify(parsed.collection)).byteLength,
        featureCount: parsed.featureCount,
        coordinateCount: parsed.coordinateCount,
        geometryCounts: parsed.geometryCounts,
        bounds: parsed.bounds,
        propertyKeys: parsed.propertyKeys,
        importedAt,
        crs: 'OGC:CRS84',
        collection: parsed.collection,
      }
      await saveGeoLayer(record)
      await refreshLayers()
      setParsed(null)
      setCsvTable(null)
      setCsvLongitudeColumn('')
      setCsvLatitudeColumn('')
      setCsvCrsReviewed(false)
      setCsvSkippedRows(0)
      setCsvEncoding('UTF-8')
      setFileName('')
      setFileSize(0)
      setSourceName('')
      setSourceUrl('')
      setDataUpdatedAt('')
      setLicenseNote('')
      setLicenseReviewed(false)
      setNotice('レイヤをこのブラウザーに保存しました。3Dシミュレーションで表示できます。')
      if (fileInput.current) fileInput.current.value = ''
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'レイヤを保存できませんでした。')
    } finally {
      setBusy(false)
    }
  }

  const removeLayer = async (layer: GeoLayerRecord) => {
    if (!window.confirm('「' + layer.name + '」をこのブラウザーから削除しますか？')) return
    try {
      await deleteGeoLayer(layer.id)
      await refreshLayers()
      setNotice('「' + layer.name + '」を削除しました。')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'レイヤを削除できませんでした。')
    }
  }

  const exportLayer = (layer: GeoLayerRecord) => {
    const blob = new Blob([JSON.stringify(layer.collection, null, 2)], { type: 'application/geo+json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = layer.fileName ? layer.fileName.replace(/\.(csv|geojson|json)$/i, '.geojson') : (layer.id + '.geojson')
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="data-studio-page page-enter">
      <header className="data-studio-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> GEOSPATIAL DATA WORKSPACE</div>
          <h1>地理データ管理</h1>
          <p>公的な地理データを読み込み、検証し、3Dシミュレーションに重ねて確認するためのワークスペースです。</p>
        </div>
        <div className="data-studio-count">
          <Layers3 size={17} />
          <span><strong>{layers.length}</strong><small>登録済みレイヤ</small></span>
        </div>
      </header>

      <div className="data-studio-notice">
        <ShieldAlert size={17} />
        <div><strong>データの正確性を守るために</strong><span>この機能はGeoJSONの構造と座標範囲を検証します。ファイルの内容・出典・ライセンスが正しいことを自動保証するものではありません。登録前に提供元と利用条件を確認してください。</span></div>
      </div>

      {error && <div className="data-feedback error-feedback" role="alert"><AlertCircle size={16} />{error}</div>}
      {notice && <div className="data-feedback success-feedback" role="status"><CheckCircle2 size={16} />{notice}</div>}

      <div className="data-studio-grid">
        <section className="data-panel import-panel">
          <div className="data-panel-heading">
            <div><span className="section-kicker">IMPORT DATA</span><h2>地理データを追加</h2></div>
            <span className="data-panel-icon"><FileJson size={19} /></span>
          </div>

          <div
            className={'geo-dropzone' + (dragging ? ' is-dragging' : '') + (parsed ? ' has-file' : '')}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <span className="geo-drop-icon"><Upload size={22} /></span>
            <strong>{busy ? 'ファイルを検証しています…' : (parsed || csvTable) ? fileName : 'GeoJSON / CSVファイルをここにドロップ'}</strong>
            <span>{parsed ? parsed.featureCount.toLocaleString('ja-JP') + ' 地物 ・ ' + formatByteSize(fileSize) : csvTable ? csvTable.rows.length.toLocaleString('ja-JP') + ' CSV行 ・ ' + csvEncoding : 'またはファイルを選択してください'}</span>
            <button type="button" className="button button-secondary" onClick={() => fileInput.current?.click()} disabled={busy}>
              <FileUp size={15} /> ファイルを選択
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".geojson,.json,.csv,application/geo+json,application/json,text/csv"
              aria-label="GeoJSONファイルを選択"
              onChange={(event) => void handleFile(event.target.files?.[0])}
              hidden
            />
            <small>対応形式：GeoJSON / JSON / CSV　・　各ファイル上限：{formatByteSize(MAX_GEOJSON_BYTES)}　・　合計保存上限：{formatByteSize(MAX_TOTAL_GEOJSON_BYTES)}　・　地物上限：50,000件</small>
          </div>

          {csvTable && !parsed && (
            <div className="csv-mapping-form">
              <div className="csv-mapping-heading">
                <div><span className="section-kicker">CSV COORDINATE MAPPING</span><strong>CSVの列を地図座標に対応付け</strong></div>
                <span>{csvTable.rows.length.toLocaleString('ja-JP')} 行 / {csvEncoding}</span>
              </div>
              <p>CSV内の経度・緯度の列を指定します。列名から自動検出した場合も、元データの列見出しと値を必ず確認してください。</p>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="csv-longitude-column">経度の列（Longitude）</label>
                  <select id="csv-longitude-column" value={csvLongitudeColumn} onChange={(event) => setCsvLongitudeColumn(event.target.value)}>
                    <option value="">列を選択してください</option>
                    {csvTable.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="csv-latitude-column">緯度の列（Latitude）</label>
                  <select id="csv-latitude-column" value={csvLatitudeColumn} onChange={(event) => setCsvLatitudeColumn(event.target.value)}>
                    <option value="">列を選択してください</option>
                    {csvTable.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                  </select>
                </div>
              </div>
              <label className="license-check">
                <input type="checkbox" checked={csvCrsReviewed} onChange={(event) => setCsvCrsReviewed(event.target.checked)} />
                <span>元データの仕様を確認し、選択した列がWGS84 / OGC:CRS84の経度・緯度であることを確認しました。</span>
              </label>
              <button type="button" className="button button-primary" onClick={previewCsv} disabled={busy || !csvLongitudeColumn || !csvLatitudeColumn || !csvCrsReviewed}>
                <MapPin size={15} /> ポイントGeoJSONへ変換してプレビュー
              </button>
              <div className="csv-column-preview">
                <strong>先頭3行のプレビュー</strong>
                <div className="csv-preview-table">
                  {csvTable.rows.slice(0, 3).map((row, rowIndex) => (
                    <div className="csv-preview-row" key={rowIndex}>
                      <span>{rowIndex + 1}</span>
                      <span>{row[csvTable.headers.indexOf(csvLongitudeColumn)] || '—'}</span>
                      <span>{row[csvTable.headers.indexOf(csvLatitudeColumn)] || '—'}</span>
                    </div>
                  ))}
                </div>
                <small>表示順：行番号 / 選択した経度 / 選択した緯度</small>
              </div>
            </div>
          )}

          {parsed && (
            <form className="geo-import-form" onSubmit={saveLayer}>
              <div className="geo-validation-title"><CheckCircle2 size={16} /><strong>{csvTable ? 'CSVをポイントGeoJSONに変換しました' : '構造検証に合格しました'}</strong><span>WGS84経緯度として解釈</span></div>
              {csvSkippedRows > 0 && <div className="csv-skipped-note">{csvSkippedRows.toLocaleString('ja-JP')} 行は座標が欠損または範囲外のため、地図レイヤから除外されます。</div>}
              <div className="geo-summary-grid">
                <div><strong>{parsed.featureCount.toLocaleString('ja-JP')}</strong><span>地物数</span></div>
                <div><strong>{parsed.coordinateCount.toLocaleString('ja-JP')}</strong><span>座標数</span></div>
                <div><strong>{Object.keys(parsed.geometryCounts).length}</strong><span>形状種別</span></div>
              </div>
              <div className="geo-bounds">
                <span>座標範囲（経度・緯度）</span>
                <strong>{parsed.bounds.west.toFixed(5)}, {parsed.bounds.south.toFixed(5)}</strong>
                <strong>{parsed.bounds.east.toFixed(5)}, {parsed.bounds.north.toFixed(5)}</strong>
              </div>
              <div className="form-field">
                <label htmlFor="geo-layer-name">レイヤ名</label>
                <input id="geo-layer-name" value={layerName} onChange={(event) => setLayerName(event.target.value)} maxLength={80} required />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="geo-category">データ分類</label>
                  <select id="geo-category" value={category} onChange={(event) => setCategory(event.target.value as GeoLayerCategory)}>
                    {categories.map((item) => <option key={item} value={item}>{GEO_CATEGORY_LABELS[item]}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="geo-source">提供元・機関</label>
                  <input id="geo-source" value={sourceName} onChange={(event) => setSourceName(event.target.value)} maxLength={120} placeholder="例：国土交通省" />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="geo-source-url">出典URL</label>
                <input id="geo-source-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://..." />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="geo-updated">データ作成・更新日</label>
                  <input id="geo-updated" type="date" value={dataUpdatedAt} onChange={(event) => setDataUpdatedAt(event.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="geo-license">利用条件・ライセンス</label>
                  <input id="geo-license" value={licenseNote} onChange={(event) => setLicenseNote(event.target.value)} maxLength={180} placeholder="例：利用規約を確認中" />
                </div>
              </div>
              <label className="license-check">
                <input type="checkbox" checked={licenseReviewed} onChange={(event) => setLicenseReviewed(event.target.checked)} />
                <span>提供元の利用規約・出典表示・加工条件を確認しました。</span>
              </label>
              <div className="geo-import-actions">
                <button className="button button-primary" type="submit" disabled={busy}><Database size={15} /> このレイヤを登録</button>
                <button className="button button-secondary" type="button" onClick={() => { setParsed(null); setCsvTable(null); setError(''); setNotice(''); if (fileInput.current) fileInput.current.value = '' }}>キャンセル</button>
              </div>
            </form>
          )}

          {!parsed && !busy && (
            <div className="data-format-info">
              <Info size={15} />
              <div><strong>対応する座標系</strong><p>OGC:CRS84 / WGS84（経度・緯度）のGeoJSONに対応します。JGD2011・JGD2024など別の座標系を含むデータは、QGIS等で座標系を確認し、WGS84へ再投影してから読み込んでください。座標系を推測して自動変換することはありません。</p></div>
            </div>
          )}
        </section>

        <aside className="data-panel source-guide-panel">
          <div className="data-panel-heading">
            <div><span className="section-kicker">DATA QUALITY</span><h2>読み込み前の確認</h2></div>
            <span className="data-panel-icon"><ShieldAlert size={19} /></span>
          </div>
          <div className="quality-check-list">
            <div><CheckCircle2 size={15} /><span><strong>座標の範囲</strong><small>経度・緯度が地理的な範囲内か検査</small></span></div>
            <div><CheckCircle2 size={15} /><span><strong>GeoJSON構造</strong><small>Feature・Geometry・座標配列を検査</small></span></div>
            <div><CheckCircle2 size={15} /><span><strong>容量と地物数</strong><small>ブラウザー負荷を抑える上限を設定</small></span></div>
            <div><Info size={15} /><span><strong>出典とライセンス</strong><small>提供元の正当性はユーザーが確認</small></span></div>
          </div>
          <div className="source-guide-links">
            <strong>公的データの確認先</strong>
            <a href="https://service.gsi.go.jp/kiban/app/" target="_blank" rel="noreferrer"><MapPin size={14} /> 国土地理院・基盤地図情報 <Link2 size={12} /></a>
            <a href="https://nlftp.mlit.go.jp/ksj/" target="_blank" rel="noreferrer"><Layers3 size={14} /> 国土数値情報 <Link2 size={12} /></a>
            <a href="https://www.gsi.go.jp/bousaichiri/hinanbasho.html" target="_blank" rel="noreferrer"><MapPin size={14} /> 指定緊急避難場所・避難所 <Link2 size={12} /></a>
            <a href="https://disaportal.gsi.go.jp/" target="_blank" rel="noreferrer"><ShieldAlert size={14} /> ハザードマップポータル <Link2 size={12} /></a>
            <a href="https://www.city.uwajima.ehime.jp/uploaded/library/382035_evacuation_space.csv" target="_blank" rel="noreferrer"><FileUp size={14} /> 宇和島市・指定緊急避難場所CSVを取得（2024-04-01 / CC BY 4.0） <Link2 size={12} /></a>
            <a href="https://www.city.uwajima.ehime.jp/site/opendata-catalog/evacuation-space.html" target="_blank" rel="noreferrer"><MapPin size={14} /> 宇和島市・指定緊急避難場所（CSV） <Link2 size={12} /></a>
            <a href="https://www.city.uwajima.ehime.jp/site/opendata-catalog/shiteihinanbasyo.html" target="_blank" rel="noreferrer"><MapPin size={14} /> 宇和島市・指定避難所一覧（CSV） <Link2 size={12} /></a>
            <a href="https://www.city.uwajima.ehime.jp/site/opendata-catalog/tsunamihinanbiru.html" target="_blank" rel="noreferrer"><Waves size={14} /> 宇和島市・津波避難ビル一覧（CSV） <Link2 size={12} /></a>
            <a href="https://www.city.uwajima.ehime.jp/site/gesuido/usuishusshui.html" target="_blank" rel="noreferrer"><ShieldAlert size={14} /> 宇和島市・雨水出水浸水想定区域図 <Link2 size={12} /></a>
          </div>
          <div className="local-storage-note"><Database size={14} /><span>登録したデータはこのブラウザーのIndexedDBに保存されます。各ファイル20 MB、合計100 MBまでです。サーバーへ送信されず、端末・ブラウザー間では共有されません。</span></div>
        </aside>
      </div>

      <section className="data-panel registered-layers-panel">
        <div className="data-panel-heading">
          <div><span className="section-kicker">REGISTERED LAYERS</span><h2>登録済みデータレイヤ</h2></div>
          <button type="button" className="text-button" onClick={() => void refreshLayers()}><RefreshCw size={13} /> 再読み込み</button>
        </div>
        {layers.length === 0 ? (
          <div className="empty-data-state"><Database size={23} /><strong>まだ地理データが登録されていません</strong><span>GeoJSONまたは座標付きCSVを読み込むと、ここで管理して3Dシミュレーションに表示できます。</span></div>
        ) : (
          <div className="registered-layer-list">
            {layers.map((layer) => (
              <article className="registered-layer-item" key={layer.id}>
                <span className={'layer-category-marker category-' + layer.category}><Layers3 size={16} /></span>
                <div className="registered-layer-main">
                  <strong>{layer.name}</strong>
                  <span>{GEO_CATEGORY_LABELS[layer.category]} ・ {layer.featureCount.toLocaleString('ja-JP')} 地物 ・ 保存サイズ {formatByteSize(layer.byteSize)}</span>
                  <small>{layer.sourceName} ・ 登録 {new Date(layer.importedAt).toLocaleString('ja-JP')}</small>
                  {layer.sourceUrl && <a href={layer.sourceUrl} target="_blank" rel="noreferrer">{layer.sourceUrl}</a>}
                </div>
                <div className="layer-review-status">{layer.licenseReviewed ? <span className="reviewed"><CheckCircle2 size={13} /> 利用条件確認済み</span> : <span className="unreviewed"><AlertCircle size={13} /> 利用条件未確認</span>}</div>
                <div className="registered-layer-actions">
                  <button type="button" className="icon-button" onClick={() => exportLayer(layer)} title="GeoJSONを書き出す" aria-label={layer.name + 'をGeoJSONで書き出す'}><ArrowDownToLine size={15} /></button>
                  <button type="button" className="icon-button delete-layer-button" onClick={() => void removeLayer(layer)} title="削除" aria-label={layer.name + 'を削除'}><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <p className="data-studio-footnote">3D表示では読み込んだ地物を相対縮尺の平面レイヤとして表示します。標高データを読み込んでいない場合、地形への正確なドレープや実際の高さ表現は行いません。</p>
    </div>
  )
}

export default DataStudioPage
