import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useAppStore } from './store'

vi.mock('./components/Scene3D', () => ({
  Scene3D: ({ onSelectLocation }: { onSelectLocation: (location: {
    title: string
    position: { x: number; z: number }
    elevation: number
    source: string
    note: string
  }) => void }) => (
    <button type="button" onClick={() => onSelectLocation({
      title: '仮想地点',
      position: { x: 1.25, z: -2.5 },
      elevation: 1.2,
      source: 'B: 仮想シミュレーションデータ',
      note: 'テスト用の仮想地点です。',
    })}>テスト地点を選択</button>
  ),
}))

describe('アプリの主要画面', () => {
  afterEach(cleanup)

  beforeEach(() => {
    window.localStorage.clear()
    useAppStore.setState({
      selectedLocation: null,
      selectedFacilityId: null,
      facilities: [],
      toolMode: 'navigate',
    })
  })

  it('ホームを表示し、3Dシミュレーションへ移動してレイヤを切り替える', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /現実の街を/ })).toBeInTheDocument()
    expect(screen.getAllByText('実データ未接続').length).toBeGreaterThan(0)

    const nav = within(screen.getByRole('navigation', { name: 'メインナビゲーション' }))
    fireEvent.click(nav.getByRole('button', { name: '3Dシミュレーション' }))
    expect(await screen.findByRole('heading', { name: '3Dシミュレーション' })).toBeInTheDocument()

    const terrainToggle = screen.getByRole('checkbox', { name: '仮想地形レイヤ' })
    expect(terrainToggle).toBeChecked()
    fireEvent.click(terrainToggle)
    expect(terrainToggle).not.toBeChecked()
  })

  it('選択地点を右側パネルに表示し、避難分析が未実装と明示する', async () => {
    render(<App />)
    const nav = within(screen.getByRole('navigation', { name: 'メインナビゲーション' }))
    fireEvent.click(nav.getByRole('button', { name: '3Dシミュレーション' }))
    fireEvent.click(screen.getByRole('button', { name: 'テスト地点を選択' }))
    expect(await screen.findByText('表示用標高')).toBeInTheDocument()
    expect(screen.getByText('浸水想定')).toBeInTheDocument()

    fireEvent.click(nav.getByRole('button', { name: '避難分析' }))
    expect(screen.getByText('実データに基づくルート分析は未実装です')).toBeInTheDocument()
  })

  it('洪水のクイックアクセスで仮想レイヤを有効にする', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /洪水ハザードを体験/ }))

    expect(await screen.findByRole('heading', { name: '3Dシミュレーション' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '洪水区域レイヤ' })).toBeChecked()
  })
})
