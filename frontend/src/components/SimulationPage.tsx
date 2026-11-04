import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  Building2,
  ChevronDown,
  Database,
  CircleHelp,
  Crosshair,
  Droplets,
  Eye,
  EyeOff,
  Focus,
  Home,
  Layers3,
  MapPin,
  Mountain,
  Move,
  Pause,
  Play,
  Plus,
  Rotate3D,
  Route,
  Save,
  Shield,
  Square,
  Trash2,
  Waves,
} from 'lucide-react'
import { demoLayers, DEMO_ONLY_WARNING, type LayerId, type LocalPosition, type SelectedLocation, type VirtualFacility } from '../data/demo'
import type { ExperimentReport } from '../data/reports'
import { useAppStore } from '../store'
import { GEO_LAYERS_CHANGED_EVENT, listGeoLayers } from '../data/geoStore'
import { GEO_CATEGORY_LABELS, type GeoJsonFeature, type GeoLayerRecord } from '../data/geojson'

const Scene3D = lazy(() => import('./Scene3D').then(({ Scene3D: scene }) => ({ default: scene })))

interface SimulationPageProps {
  notify: (message: string) => void
  onSave: (objects: ExperimentReport['virtualObjects']) => boolean
}

type CameraView = 'overview' | 'oblique' | 'ground'

const layerIcons: Record<LayerId, typeof Mountain> = {
  terrain: Mountain,
  buildings: Building2,
  roads: Route,
  river: Waves,
  flood: Droplets,
  shelters: MapPin,
  virtual: Crosshair,
}

const layerColors: Record<LayerId, string> = {
  terrain: 'mint',
  buildings: 'slate',
  roads: 'amber',
  river: 'cyan',
  flood: 'blue',
  shelters: 'green',
  virtual: 'orange',
}

export function SimulationPage({ notify, onSave }: SimulationPageProps) {
  const layers = useAppStore((state) => state.layers)
  const toggleLayer = useAppStore((state) => state.toggleLayer)
  const selectedLocation = useAppStore((state) => state.selectedLocation)
  const selectLocation = useAppStore((state) => state.selectLocation)
  const facilities = useAppStore((state) => state.facilities)
  const selectedFacilityId = useAppStore((state) => state.selectedFacilityId)
  const selectFacility = useAppStore((state) => state.selectFacility)
  const toolMode = useAppStore((state) => state.toolMode)
  const setToolMode = useAppStore((state) => state.setToolMode)
  const addFacility = useAppStore((state) => state.addFacility)
  const moveFacility = useAppStore((state) => state.moveFacility)
  const removeSelectedFacility = useAppStore((state) => state.removeSelectedFacility)
  const [cameraView, setCameraView] = useState<CameraView>('overview')
  const [floodStep, setFloodStep] = useState(() => useAppStore.getState().layers.flood ? 1 : 0)
  const [playing, setPlaying] = useState(false)
  const [geoLayers, setGeoLayers] = useState<GeoLayerRecord[]>([])
  const [visibleGeoLayerIds, setVisibleGeoLayerIds] = useState<string[] | null>(null)
  const [selectedGeoFeature, setSelectedGeoFeature] = useState<{ layer: GeoLayerRecord; feature: GeoJsonFeature } | null>(null)
  const knownGeoLayerIds = useRef<Set<string>>(new Set())
  const visibleGeoLayers = geoLayers.filter((layer) => visibleGeoLayerIds?.includes(layer.id))
  const showImportedLayers = visibleGeoLayers.length > 0

  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const records = await listGeoLayers()
        if (active) {
          const previouslyKnownIds = knownGeoLayerIds.current
          const recordIds = new Set(records.map((layer) => layer.id))
          const newlyAddedIds = records.filter((layer) => !previouslyKnownIds.has(layer.id)).map((layer) => layer.id)
          knownGeoLayerIds.current = recordIds
          setVisibleGeoLayerIds((current) => {
            const base = current ?? [...previouslyKnownIds]
            return [...new Set([...base.filter((id) => recordIds.has(id)), ...newlyAddedIds])]
          })
          setGeoLayers(records)
          setSelectedGeoFeature((selected) => selected && records.some((layer) => layer.id === selected.layer.id) ? selected : null)
        }
      } catch (error) {
        if (active) notify(error instanceof Error ? '地理データを読み込めませんでした: ' + error.message : '地理データを読み込めませんでした。')
      }
    }
    void refresh()
    window.addEventListener(GEO_LAYERS_CHANGED_EVENT, refresh)
    return () => {
      active = false
      window.removeEventListener(GEO_LAYERS_CHANGED_EVENT, refresh)
    }
  }, [notify])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => {
      if (floodStep >= 3) {
        setPlaying(false)
        notify('仮想シナリオの表示が完了しました。実際の浸水時刻を示すものではありません。')
        return
      }
      setFloodStep(floodStep + 1)
    }, 850)
    return () => window.clearTimeout(timer)
  }, [playing, floodStep, notify])

  const placeAt = (position: LocalPosition) => {
    if (toolMode === 'place') {
      addFacility(position)
      notify('仮想・未設置の防災拠点を配置しました。')
      return
    }
    if (toolMode === 'move' && selectedFacilityId) {
      moveFacility(selectedFacilityId, position)
      notify('仮想施設の位置を変更しました。')
      return
    }
    const location: SelectedLocation = {
      title: '仮想地点',
      position,
      elevation: null,
      source: 'B: 仮想シミュレーションデータ',
      note: '表示用ローカル座標です。実際の地理座標・測量標高ではありません。',
    }
    selectLocation(location)
  }

  const toggleFloodPlayback = () => {
    if (floodStep >= 3 && !playing) setFloodStep(0)
    if (!layers.flood) {
      toggleLayer('flood')
      notify('教育用の仮想洪水レイヤを表示しました。実際の浸水想定区域ではありません。')
    }
    setPlaying((current) => !current)
  }

  const changeLayer = (id: LayerId) => {
    toggleLayer(id)
    notify(`${demoLayers.find((layer) => layer.id === id)?.label ?? id}レイヤの表示を切り替えました。`)
  }

  const selectedFacility = facilities.find((facility) => facility.id === selectedFacilityId)

  const toggleImportedLayer = (id: string, visible: boolean) => {
    setVisibleGeoLayerIds((current) => {
      const currentIds = current ?? geoLayers.map((layer) => layer.id)
      if (visible) return currentIds.includes(id) ? currentIds : [...currentIds, id]
      return currentIds.filter((currentId) => currentId !== id)
    })
    if (!visible && selectedGeoFeature?.layer.id === id) setSelectedGeoFeature(null)
  }

  return (
    <div className="simulation-page page-enter">
      <div className="sim-header">
        <div className="sim-title">
          <div className="eyebrow"><span className="eyebrow-line" /> 仮想シミュレーション</div>
          <h1>3Dシミュレーション</h1>
        </div>
        <div className="sim-header-actions">
          <label className="region-select">
            <MapPin size={14} />
            <span>表示空間</span>
            <select aria-label="表示空間"><option>DEMO / 仮想エリア</option></select>
            <ChevronDown size={13} />
          </label>
          <span className="data-connected"><span /> {geoLayers.length > 0 ? `GeoJSON ${geoLayers.length} レイヤ` : '実データ未接続'}</span>
        </div>
      </div>

      <div className="simulation-workspace">
        <aside className="sim-panel layer-panel">
          <div className="sim-panel-heading"><span className="section-kicker">SCENE LAYERS</span><Layers3 size={15} /></div>
          <div className="region-card">
            <div className="region-card-icon"><Mountain size={17} /></div>
            <div><strong>仮想デモ空間</strong><small>宇和島市の実測データではありません</small></div>
          </div>
          <div className="layer-list-label">仮想デモレイヤ <span>クリックで切替</span></div>
          <div className="layer-list">
            {demoLayers.map(({ id, label, detail }) => {
              const Icon = layerIcons[id]
              return (
                <label className={`layer-row ${layers[id] ? 'layer-enabled' : ''}`} key={id}>
                  <span className={`layer-icon ${layerColors[id]}`}><Icon size={15} /></span>
                  <span className="layer-copy"><strong>{label}</strong><small>{detail}</small></span>
                  <input aria-label={`${label}レイヤ`} type="checkbox" checked={layers[id]} onChange={() => changeLayer(id)} />
                  <span className="toggle-track" aria-hidden="true"><span /></span>
                </label>
              )
            })}
          </div>
          {geoLayers.length > 0 && (
            <div className="imported-layers-section">
              <div className="imported-layers-heading">
                <span><Database size={13} /> 読み込んだGeoJSON</span>
                <small>{visibleGeoLayers.length} / {geoLayers.length} 表示中</small>
              </div>
              {geoLayers.map((geoLayer) => {
                const isVisible = visibleGeoLayerIds?.includes(geoLayer.id) ?? true
                return (
                  <label className={`layer-row imported-layer-toggle ${isVisible ? 'layer-enabled' : ''}`} key={geoLayer.id}>
                    <span className={`layer-icon geo-${geoLayer.category}`}><Database size={14} /></span>
                    <span className="layer-copy"><strong>{geoLayer.name}</strong><small>{GEO_CATEGORY_LABELS[geoLayer.category]} ・ {geoLayer.featureCount.toLocaleString('ja-JP')} 地物</small></span>
                    <input aria-label={geoLayer.name + 'レイヤ'} type="checkbox" checked={isVisible} onChange={(event) => toggleImportedLayer(geoLayer.id, event.target.checked)} />
                    <span className="toggle-track" aria-hidden="true"><span /></span>
                  </label>
                )
              })}
            </div>
          )}
          <div className="layer-legend">
            <div className="legend-heading"><span>{showImportedLayers ? 'インポートデータの凡例' : '表示の凡例'}</span><CircleHelp size={13} /></div>
            {showImportedLayers ? (
              [...new Set(visibleGeoLayers.map((layer) => layer.category))].map((category) => (
                <div key={category}><i className={"legend-swatch geo-swatch-" + category} />{GEO_CATEGORY_LABELS[category]}</div>
              ))
            ) : (
              <>
                <div><i className="legend-swatch terrain-swatch" />標高色（仮想）</div>
                <div><i className="legend-swatch flood-swatch" />洪水表示（教育用仮想）</div>
                <div><i className="legend-swatch shelter-swatch" />仮想避難施設</div>
              </>
            )}
          </div>
          <div className="layer-source-note"><Database size={13} /> {showImportedLayers ? '出典・利用条件は各インポートレイヤに記録' : '公的データは未取得です'}</div>
        </aside>

        <section className="scene-panel" aria-label="3Dシミュレーション">
          <div className="scene-top-overlay">
            <span className={showImportedLayers && geoLayers.length > 0 ? 'scene-demo-badge imported' : 'scene-demo-badge'}><span /> {showImportedLayers && geoLayers.length > 0 ? 'IMPORTED GEOJSON' : 'DEMO DATA'}</span>
            <span className="scene-coordinate">{showImportedLayers && geoLayers.length > 0 ? '相対縮尺 / 平面表示' : 'ローカル座標 / 単位なし'}</span>
          </div>
          <div className="scene-canvas">
            <Suspense fallback={<div className="scene-loading" role="status"><Mountain size={19} /> 3D地形データを準備しています…</div>}>
              <Scene3D
                layers={layers}
                floodStep={floodStep}
                facilities={facilities}
                toolMode={toolMode}
                selectedFacilityId={selectedFacilityId}
                cameraView={cameraView}
                geoLayers={visibleGeoLayers}
                geoLayersVisible={showImportedLayers}
                onSelectGeoFeature={(layer, feature) => {
                  setSelectedGeoFeature({ layer, feature })
                  selectLocation(null)
                  selectFacility(null)
                  notify('選択した地物の属性を右パネルに表示しました。')
                }}
                onSelectLocation={(location) => {
                  setSelectedGeoFeature(null)
                  selectLocation(location)
                  notify(`${location.title}を選択しました。詳細は右パネルに表示しています。`)
                }}
                onPlace={placeAt}
                onSelectFacility={(id) => {
                  setSelectedGeoFeature(null)
                  selectFacility(id)
                  selectLocation(null)
                  notify('仮想防災拠点を選択しました。')
                }}
              />
            </Suspense>
            <div className="scene-view-controls" role="group" aria-label="カメラ視点">
              <button type="button" className={cameraView === 'overview' ? 'selected' : ''} title="初期視点へ戻す" onClick={() => setCameraView('overview')}><Home size={15} /><span>ホーム</span></button>
              <button type="button" className={cameraView === 'oblique' ? 'selected' : ''} title="斜め視点" onClick={() => setCameraView('oblique')}><Rotate3D size={15} /><span>斜め</span></button>
              <button type="button" className={cameraView === 'ground' ? 'selected' : ''} title="水平視点" onClick={() => setCameraView('ground')}><Focus size={15} /><span>水平</span></button>
            </div>
            {toolMode !== 'navigate' && (
              <div className="scene-tool-hint"><Move size={14} /> {toolMode === 'place' ? '地形をクリックして仮想施設を配置' : '地形をクリックして選択中の施設を移動'}</div>
            )}
            <div className="scene-compass" aria-label="北方向"><span>N</span><div className="compass-arrow" /><small>仮想空間</small></div>
            <div className="scene-scale">{showImportedLayers && geoLayers.length > 0 ? '読み込み済みGeoJSON / 相対縮尺 / 標高なし' : '地形・建物・道路・施設：仮想データ'}</div>
          </div>
          <div className="scene-help"><span><Move size={13} /> 左ドラッグで回転</span><span><Move size={13} /> 右ドラッグで移動</span><span><Plus size={13} /> ホイールでズーム</span><span className="touch-help">タッチ操作対応</span></div>
        </section>

        <aside className="sim-panel detail-panel">
          <div className="sim-panel-heading"><span className="section-kicker">INSPECTOR</span><Eye size={15} /></div>
          {selectedGeoFeature ? (
            <GeoFeatureDetails layer={selectedGeoFeature.layer} feature={selectedGeoFeature.feature} />
          ) : selectedFacility ? (
            <FacilityDetails
              facility={selectedFacility}
              onMove={() => {
                setToolMode('move')
                notify('移動モードです。地形上の移動先をクリックしてください。')
              }}
              onDelete={() => {
                removeSelectedFacility()
                notify('選択中の仮想施設を削除しました。')
              }}
            />
          ) : selectedLocation ? (
            <LocationDetails location={selectedLocation} />
          ) : (
            <div className="inspector-empty">
              <span className="inspector-empty-icon"><Crosshair size={19} /></span>
              <strong>地点を選択</strong>
              <p>3D空間の地形・建物・仮想施設をクリックすると、デモ上の情報が表示されます。</p>
              <div className="inspector-tip"><Move size={14} /> 左ドラッグでカメラを回転</div>
              <div className="inspector-tip"><EyeOff size={14} /> 左のパネルでレイヤ切替</div>
            </div>
          )}
          <div className="inspector-divider" />
          {selectedGeoFeature ? (
            <>
              <div className="inspector-meta">
                <span>データ提供元</span><strong>{selectedGeoFeature.layer.sourceName || '未入力'}</strong>
                <span>データ更新</span><strong>{selectedGeoFeature.layer.dataUpdatedAt || '未入力'}</strong>
                <span>利用条件</span><strong>{selectedGeoFeature.layer.licenseNote || '未確認'}</strong>
              </div>
              <div className="inspector-warning"><Shield size={14} /><span>GeoJSONは相対縮尺の平面表示です。浸水深・標高・避難安全性の判定には使用できません。</span></div>
            </>
          ) : (
            <>
              <div className="inspector-meta">
                <span>対象地域</span><strong>仮想デモ空間</strong>
                <span>データ更新</span><strong>公的データなし</strong>
                <span>座標系</span><strong>表示用ローカル座標</strong>
              </div>
              <div className="inspector-warning"><Shield size={14} /><span>実際の地理・標高・災害リスクを示すデータは未接続です。</span></div>
            </>
          )}
        </aside>
      </div>

      <div className="simulation-bottom">
        <section className="timeline-panel">
          <div className="timeline-heading">
            <div><span className="section-kicker">EDUCATIONAL SCENARIO</span><strong>仮想シナリオ</strong></div>
            <span className="scenario-tag"><Droplets size={13} /> 河川氾濫 / 教育用仮想表示</span>
          </div>
          <div className="timeline-controls">
            <button type="button" className="play-button" aria-label={playing ? '一時停止' : '仮想シナリオを再生'} onClick={toggleFloodPlayback}>{playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button>
            <button type="button" className="step-button" aria-label="シナリオを停止" onClick={() => {
              setPlaying(false)
              setFloodStep(0)
              notify('仮想シナリオの表示を停止しました。')
            }}><Square size={11} fill="currentColor" /></button>
            <div className="timeline-range-wrap">
              <div className="timeline-step-labels"><span>開始</span><span>仮想表示の進行段階 <b>{floodStep} / 3</b></span><span>終了</span></div>
              <input aria-label="仮想シナリオの段階" type="range" min="0" max="3" step="1" value={floodStep} onChange={(event) => {
                setFloodStep(Number(event.target.value))
                if (!layers.flood) toggleLayer('flood')
              }} />
            </div>
          </div>
          <div className="timeline-notice"><Droplets size={13} /> 洪水区域は仮想表現です。実際の浸水範囲・水位・到達時刻を予測するものではありません。</div>
        </section>

        <section className="experiment-panel">
          <div className="experiment-heading"><span className="section-kicker">VIRTUAL EXPERIMENT</span><span className="experiment-count">{facilities.length} 件</span></div>
          <div className="experiment-actions">
            <button type="button" className={`button ${toolMode === 'place' ? 'button-active' : 'button-secondary'}`} onClick={() => {
              const nextMode = toolMode === 'place' ? 'navigate' : 'place'
              setToolMode(nextMode)
              notify(nextMode === 'place' ? '配置モードです。地形をクリックして仮想施設を設置してください。' : '配置モードを終了しました。')
            }}><Crosshair size={14} /> {toolMode === 'place' ? '配置を終了' : '施設を配置'}</button>
            <button type="button" className="button button-secondary save-experiment" onClick={() => {
              if (onSave(facilities)) notify('仮想実験を保存しました。レポートからJSONを書き出せます。')
            }}><Save size={14} /> 実験を保存</button>
          </div>
          <p>施設は仮想・未設置です。実際の施設・避難能力を示しません。</p>
        </section>
      </div>

      <div className="simulation-caveat"><Shield size={13} /><span>{showImportedLayers && geoLayers.length > 0 ? '読み込んだGeoJSONの地物を相対縮尺の平面として表示しています。実測標高へのドレープや災害リスク判定は行いません。出典・利用条件を確認してください。' : DEMO_ONLY_WARNING}</span><a href="https://disaportal.gsi.go.jp/" target="_blank" rel="noreferrer">公式情報 <ChevronDown size={12} /></a></div>
    </div>
  )
}

function GeoFeatureDetails({ layer, feature }: {
  layer: GeoLayerRecord
  feature: GeoJsonFeature
}) {
  const properties = feature.properties ?? {}
  const preferredNameKeys = ['name', '名称', '施設名', '施設名称', '地点名', '名称_1']
  const titleKey = preferredNameKeys.find((key) => {
    const value = properties[key]
    return value !== null && value !== undefined && String(value).trim().length > 0
  })
  const titleValue = titleKey ? properties[titleKey] : null
  const title = titleValue === null || titleValue === undefined
    ? '選択した地物'
    : String(titleValue)
  const entries = Object.entries(properties).slice(0, 16)

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).slice(0, 180)
      } catch {
        return '[表示できない値]'
      }
    }
    return String(value).slice(0, 180)
  }

  return (
    <div className="location-details geo-feature-details">
      <span className="selection-tag imported-tag"><span /> インポートデータ</span>
      <h2>{title}</h2>
      <div className="coordinate-readout"><Database size={14} /> {layer.name}</div>
      <div className="detail-data-grid">
        <div><span>データ分類</span><strong>{GEO_CATEGORY_LABELS[layer.category]}</strong></div>
        <div><span>形状</span><strong>{feature.geometry?.type ?? 'なし'}</strong></div>
        <div><span>地物ID</span><strong>{feature.id === undefined ? '未設定' : String(feature.id)}</strong></div>
        <div><span>座標系</span><strong>WGS84 / 経度・緯度</strong></div>
      </div>
      <div className="geo-feature-source">
        <span>出典：{layer.sourceName || '未入力'}</span>
        <span>データ更新日：{layer.dataUpdatedAt || '未入力'}</span>
        <span>利用条件：{layer.licenseNote || '未確認'}</span>
      </div>
      <div className="geo-feature-properties">
        <strong>属性情報</strong>
        {entries.length === 0 ? (
          <p>この地物に属性情報はありません。</p>
        ) : (
          <dl>
            {entries.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd title={formatValue(value)}>{formatValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}
        {Object.keys(properties).length > entries.length && (
          <small>ほか {Object.keys(properties).length - entries.length} 項目は詳細表示を省略しています。</small>
        )}
      </div>
      <p className="detail-note">表示位置は対象データの範囲に合わせた相対縮尺です。実測標高へのドレープや災害リスクの判定は行っていません。</p>
    </div>
  )
}

function LocationDetails({ location }: { location: SelectedLocation }) {
  return (
    <div className="location-details">
      <span className="selection-tag"><span /> 仮想地点</span>
      <h2>{location.title}</h2>
      <div className="coordinate-readout"><MapPin size={14} /> x {location.position.x.toFixed(2)} / z {location.position.z.toFixed(2)}</div>
      <div className="detail-data-grid">
        <div><span>表示用標高</span><strong>{location.elevation === null ? '未取得' : `${location.elevation.toFixed(2)} (仮想値)`}</strong></div>
        <div><span>浸水想定</span><strong>実データ未取得</strong></div>
        <div><span>近くの避難場所</span><strong>実データ未取得</strong></div>
        <div><span>データ分類</span><strong>{location.source}</strong></div>
      </div>
      <p className="detail-note">{location.note}</p>
      <div className="unavailable-block"><CircleHelp size={14} /><span>公的な災害情報・避難施設情報はこの地点に結び付いていません。</span></div>
    </div>
  )
}

function FacilityDetails({ facility, onMove, onDelete }: {
  facility: VirtualFacility
  onMove: () => void
  onDelete: () => void
}) {
  return (
    <div className="location-details facility-details">
      <span className="selection-tag virtual-tag"><span /> 仮想・未設置</span>
      <h2>{facility.name}</h2>
      <div className="coordinate-readout"><MapPin size={14} /> x {facility.x.toFixed(2)} / z {facility.z.toFixed(2)}</div>
      <div className="detail-data-grid">
        <div><span>施設区分</span><strong>仮想防災拠点</strong></div>
        <div><span>実在確認</span><strong>実在しません</strong></div>
        <div><span>データ分類</span><strong>B: 仮想データ</strong></div>
        <div><span>作成日時</span><strong>{new Date(facility.createdAt).toLocaleString('ja-JP')}</strong></div>
      </div>
      <div className="facility-actions">
        <button type="button" className="button button-secondary" onClick={onMove}><Move size={14} /> 移動</button>
        <button type="button" className="button button-danger" onClick={onDelete}><Trash2 size={14} /> 削除</button>
      </div>
      <p className="detail-note">この施設は実在しません。容量・災害対応・避難効果の評価は行っていません。</p>
    </div>
  )
}
