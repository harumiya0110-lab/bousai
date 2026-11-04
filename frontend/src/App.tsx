import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  ChevronRight,
  CircleHelp,
  Database,
  Download,
  Droplets,
  FileText,
  Map,
  MapPin,
  Mountain,
  Play,
  Route,
  Shield,
  Waves,
} from 'lucide-react'
import { createExperimentDataUrl, loadExperiments, saveExperiment, type ExperimentReport } from './data/reports'
import { useAppStore } from './store'
import './App.css'

type PageId = 'home' | 'simulation' | 'data' | 'evacuation' | 'analysis' | 'reports'

const SimulationPage = lazy(() => import('./components/SimulationPage').then(({ SimulationPage: page }) => ({ default: page })))
const DataStudioPage = lazy(() => import('./components/DataStudioPage').then(({ DataStudioPage: page }) => ({ default: page })))

const navigation: { id: PageId; label: string; icon: typeof Map }[] = [
  { id: 'home', label: 'ホーム', icon: Map },
  { id: 'simulation', label: '3Dシミュレーション', icon: Mountain },
  { id: 'data', label: '地理データ管理', icon: Database },
  { id: 'evacuation', label: '避難分析', icon: Route },
  { id: 'analysis', label: 'データ分析', icon: BarChart3 },
  { id: 'reports', label: 'レポート', icon: FileText },
]

function App() {
  const [page, setPage] = useState<PageId>('home')
  const [notice, setNotice] = useState('')
  const openFloodDemo = () => {
    useAppStore.getState().setLayerVisibility('flood', true)
    setPage('simulation')
  }

  const createReport = (objects: ExperimentReport['virtualObjects']) => {
    try {
      const report = saveExperiment(objects)
      setNotice(`仮想実験「${report.name}」をこのブラウザーに保存しました。`)
      return true
    } catch (error) {
      setNotice(error instanceof Error ? `保存できませんでした: ${error.message}` : '保存できませんでした。')
      return false
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setPage('home')} aria-label="DISASTER SCOPE ホーム">
          <span className="brand-mark"><Waves size={19} strokeWidth={2.2} /></span>
          <span className="brand-copy">
            <strong>DISASTER SCOPE</strong>
            <small>防災デジタルツイン <span>v0.1.0</span></small>
          </span>
        </button>

        <nav className="main-nav" aria-label="メインナビゲーション">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-link ${page === id ? 'is-active' : ''}`}
              key={id}
              type="button"
              onClick={() => setPage(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="topbar-status">
          <span className="demo-pill"><span /> DEMO DATA</span>
          <a className="icon-button" href="https://service.gsi.go.jp/kiban/app/" target="_blank" rel="noreferrer" aria-label="データ出典を確認">
            <Database size={17} />
          </a>
        </div>
      </header>

      <main className="main-content">
        {page === 'home' && <HomePage navigate={setPage} openFloodDemo={openFloodDemo} />}
        {page === 'simulation' && <Suspense fallback={<div className="loading-screen" role="status">3Dシミュレーションを準備しています…</div>}><SimulationPage notify={setNotice} onSave={createReport} /></Suspense>}
        {page === 'data' && <Suspense fallback={<div className="loading-screen" role="status">地理データ管理を準備しています…</div>}><DataStudioPage /></Suspense>}
        {page === 'evacuation' && <StatusPage type="evacuation" navigate={setPage} />}
        {page === 'analysis' && <StatusPage type="analysis" navigate={setPage} />}
        {page === 'reports' && <ReportsPage navigate={setPage} />}
      </main>

      <footer className="safety-footer">
        <Shield size={15} />
        <span>防災の理解を支援する可視化デモです。実際の災害状況・避難経路の安全性を保証しません。</span>
        <a href="https://www.jma.go.jp/bosai/" target="_blank" rel="noreferrer">災害時は公式情報を確認 <ArrowRight size={13} /></a>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="通知を閉じる">×</button>
        </div>
      )}
    </div>
  )
}

function HomePage({ navigate, openFloodDemo }: { navigate: (page: PageId) => void; openFloodDemo: () => void }) {
  return (
    <div className="home-page page-enter">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> 防災デジタルツイン — 開発プレビュー</div>
          <h1>現実の街を、<br /><span>3Dで守る。</span></h1>
          <p>地形と災害情報を立体的に可視化し、地域の防災について学び、考えるための実験環境です。</p>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={() => navigate('simulation')}>
              <Play size={16} fill="currentColor" /> 3Dシミュレーションを開く <ArrowRight size={15} />
            </button>
            <span className="hero-version"><span className="status-dot" /> 仮想データで動作中</span>
          </div>
          <div className="hero-region">
            <MapPin size={15} />
            <span>初期対象地域（計画）</span>
            <strong>愛媛県 宇和島市</strong>
            <span className="region-note">実データ未接続</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="仮想地形のイメージ">
          <div className="visual-topline"><span><Activity size={13} /> 地形プレビュー</span><span>仮想表現</span></div>
          <svg className="terrain-art" viewBox="0 0 640 360" role="img" aria-label="仮想の山並みと河川を表した図">
            <defs>
              <linearGradient id="terrainGlow" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#49c6e8" stopOpacity=".36" />
                <stop offset="1" stopColor="#2563eb" stopOpacity=".04" />
              </linearGradient>
              <linearGradient id="terrainFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#397a83" stopOpacity=".7" />
                <stop offset="1" stopColor="#182d3e" stopOpacity=".16" />
              </linearGradient>
            </defs>
            <path d="M0 245 62 206 105 221 160 147 207 185 260 111 314 160 369 96 420 150 481 112 526 165 581 133 640 169V360H0Z" fill="url(#terrainFill)" />
            <path d="M0 245 62 206 105 221 160 147 207 185 260 111 314 160 369 96 420 150 481 112 526 165 581 133 640 169V360H0Z" fill="url(#terrainGlow)" />
            <path d="M0 245 62 206 105 221 160 147 207 185 260 111 314 160 369 96 420 150 481 112 526 165 581 133 640 169" fill="none" stroke="#7ee1ed" strokeOpacity=".78" strokeWidth="2" />
            <path d="M-5 284c73-8 92-58 161-55s100 53 174 31 97-71 161-50 86 43 159 14" fill="none" stroke="#47bfe5" strokeOpacity=".82" strokeWidth="3" />
            <path d="M0 284c73-8 92-58 161-55s100 53 174 31 97-71 161-50 86 43 159 14v80H0Z" fill="#2785aa" fillOpacity=".08" />
            <g stroke="#c5f3f5" strokeOpacity=".12">
              <path d="M0 250h640M0 280h640M0 310h640M0 340h640" />
              <path d="M70 150v210M140 130v230M210 130v230M280 110v250M350 90v270M420 110v250M490 110v250M560 120v240" />
            </g>
            <circle cx="368" cy="96" r="4" fill="#f3b84e" />
            <circle cx="368" cy="96" r="11" fill="none" stroke="#f3b84e" strokeOpacity=".52" />
          </svg>
          <div className="visual-caption"><Mountain size={14} /> 地形イメージ <span>実測標高ではありません</span></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="section-kicker">QUICK ACCESS</span><h2>防災シミュレーション</h2></div>
          <span className="section-description">機能の実装状況を明示しています</span>
        </div>
        <div className="quick-grid">
          <button className="quick-card quick-card-featured" type="button" onClick={() => navigate('simulation')}>
            <span className="quick-icon"><Mountain size={18} /></span>
            <span className="quick-title">3Dシミュレーション</span>
            <span className="quick-description">仮想地形・レイヤ・施設配置を操作</span>
            <span className="quick-action">デモを起動 <ChevronRight size={15} /></span>
          </button>
          <button className="quick-card" type="button" onClick={openFloodDemo}>
            <span className="quick-icon amber"><Droplets size={18} /></span>
            <span className="quick-title">洪水ハザードを体験</span>
            <span className="quick-description">教育用の仮想シナリオで表示を確認</span>
            <span className="quick-action">仮想表示 <ChevronRight size={15} /></span>
          </button>
          <button className="quick-card" type="button" onClick={() => navigate('simulation')}>
            <span className="quick-icon green"><Building2 size={18} /></span>
            <span className="quick-title">仮想施設を配置</span>
            <span className="quick-description">未設置の防災拠点を仮想空間で試す</span>
            <span className="quick-action">デモを起動 <ChevronRight size={15} /></span>
          </button>
          <button className="quick-card" type="button" onClick={() => navigate('reports')}>
            <span className="quick-icon purple"><FileText size={18} /></span>
            <span className="quick-title">保存した実験を見る</span>
            <span className="quick-description">このブラウザーに保存した配置を確認</span>
            <span className="quick-action">レポートを開く <ChevronRight size={15} /></span>
          </button>
        </div>
      </section>

      <section className="home-lower">
        <div className="panel data-status-panel">
          <div className="panel-heading"><div><span className="section-kicker">DATA STATUS</span><h2>データ接続状況</h2></div><span className="status-tag status-pending"><span /> 実データ未接続</span></div>
          <div className="data-status-list">
            <DataStatusRow icon={<Mountain size={16} />} name="標高・地形データ" state="未取得" />
            <DataStatusRow icon={<Droplets size={16} />} name="洪水浸水想定区域" state="未取得" />
            <DataStatusRow icon={<MapPin size={16} />} name="指定避難場所・避難所" state="未取得" />
            <DataStatusRow icon={<Database size={16} />} name="外部データ接続" state="接続なし" />
          </div>
          <div className="panel-footnote"><CircleHelp size={13} /> このデモに公的な地域データは含まれていません。</div>
        </div>

        <div className="panel source-panel">
          <div className="panel-heading"><div><span className="section-kicker">PUBLIC SOURCES</span><h2>データの出典</h2></div><BookOpen size={17} className="muted-icon" /></div>
          <a className="source-row" href="https://service.gsi.go.jp/kiban/app/" target="_blank" rel="noreferrer"><span className="source-symbol"><Mountain size={15} /></span><span><strong>国土地理院</strong><small>基盤地図情報・数値標高モデル</small></span><ArrowDownRight size={14} /></a>
          <a className="source-row" href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-A31a-2025.html" target="_blank" rel="noreferrer"><span className="source-symbol"><Droplets size={15} /></span><span><strong>国土交通省</strong><small>国土数値情報・洪水浸水想定区域</small></span><ArrowDownRight size={14} /></a>
          <a className="source-row" href="https://www.gsi.go.jp/bousaichiri/hinanbasho.html" target="_blank" rel="noreferrer"><span className="source-symbol"><MapPin size={15} /></span><span><strong>国土地理院</strong><small>指定緊急避難場所・指定避難所</small></span><ArrowDownRight size={14} /></a>
          <a className="source-detail-link" href="https://disaportal.gsi.go.jp/" target="_blank" rel="noreferrer">公式ハザード情報を確認 <ArrowRight size={13} /></a>
        </div>
      </section>
    </div>
  )
}

function DataStatusRow({ icon, name, state }: { icon: ReactNode; name: string; state: string }) {
  return <div className="data-status-row"><span className="data-row-icon">{icon}</span><span>{name}</span><span className="data-state">{state}</span></div>
}

function StatusPage({ type, navigate }: { type: 'evacuation' | 'analysis'; navigate: (page: PageId) => void }) {
  const evacuation = type === 'evacuation'
  return (
    <div className="status-page page-enter">
      <div className="page-title-row">
        <div><div className="eyebrow"><span className="eyebrow-line" /> 開発状況</div><h1>{evacuation ? '避難分析' : 'データ分析'}</h1></div>
        <span className="status-tag status-pending"><span /> 未実装</span>
      </div>
      <div className="panel status-explainer">
        <div className="status-explainer-icon">{evacuation ? <Route size={23} /> : <BarChart3 size={23} />}</div>
        <div>
          <h2>{evacuation ? '実データに基づくルート分析は未実装です' : '実データに基づく集計は未実装です'}</h2>
          <p>{evacuation
            ? 'このワークスペースには検証済み道路網・避難場所データがありません。実際の道路経路や安全性を装う結果は表示しません。'
            : '実測標高・ハザード・避難場所のデータがないため、実地域の統計やグラフは表示していません。仮の数値を実績として扱わない方針です.'}</p>
          <button className="button button-secondary" type="button" onClick={() => navigate('simulation')}><Mountain size={15} /> 仮想3Dデモを操作する <ArrowRight size={14} /></button>
        </div>
      </div>
      <div className="status-checklist">
        <div><span className="check-number">01</span><span><strong>{evacuation ? '道路ネットワーク' : '標高統計'}</strong><small>公式データの取得・範囲確認待ち</small></span><span className="data-state">未取得</span></div>
        <div><span className="check-number">02</span><span><strong>{evacuation ? '指定避難場所' : '洪水浸水区域'}</strong><small>宇和島市の対象範囲・属性確認待ち</small></span><span className="data-state">未取得</span></div>
        <div><span className="check-number">03</span><span><strong>{evacuation ? '座標系・経路検証' : '集計方法・出典表示'}</strong><small>データ検証後に実装</small></span><span className="data-state">未着手</span></div>
      </div>
    </div>
  )
}

function ReportsPage({ navigate }: { navigate: (page: PageId) => void }) {
  const [reports, setReports] = useState<ExperimentReport[] | null>(null)
  const [error, setError] = useState('')

  const refresh = () => {
    try {
      setReports(loadExperiments())
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '保存済みデータを読み込めませんでした。')
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="status-page page-enter">
      <div className="page-title-row">
        <div><div className="eyebrow"><span className="eyebrow-line" /> 仮想実験の記録</div><h1>レポート</h1></div>
        <button className="button button-secondary" type="button" onClick={() => navigate('simulation')}><Play size={14} /> 新しい実験</button>
      </div>
      <div className="panel reports-panel">
        <div className="panel-heading"><div><span className="section-kicker">SAVED IN THIS BROWSER</span><h2>保存済みの仮想実験</h2></div><button className="text-button" type="button" onClick={refresh}>再読み込み</button></div>
        {error && <p className="inline-error" role="alert">保存データの読み込みに失敗しました: {error}</p>}
        {!error && reports === null && <div className="empty-state"><span>保存データを読み込み中…</span></div>}
        {!error && reports?.length === 0 && <div className="empty-state"><FileText size={23} /><strong>保存された実験はありません</strong><span>3D画面で仮想施設を配置し、実験を保存できます。</span><button className="button button-primary" type="button" onClick={() => navigate('simulation')}>3Dシミュレーションへ <ArrowRight size={14} /></button></div>}
        {!!reports?.length && <div className="report-list">{reports.map((report) => <article className="report-item" key={report.id}><div className="report-icon"><FileText size={17} /></div><div className="report-main"><strong>{report.name}</strong><span>{new Date(report.createdAt).toLocaleString('ja-JP')} ・ 仮想施設 {report.virtualObjects.length} 件</span><small>仮想データのみ / 実際の災害・避難の予測ではありません</small></div><a className="icon-button" href={createExperimentDataUrl(report)} download={`${report.id}.json`} aria-label={`${report.name}をJSONでダウンロード`}><Download size={16} /></a></article>)}</div>}
      </div>
    </div>
  )
}

export default App
