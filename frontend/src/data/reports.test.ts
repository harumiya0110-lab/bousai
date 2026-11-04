import { beforeEach, describe, expect, it } from 'vitest'
import { createExperimentDataUrl, loadExperiments, saveExperiment } from './reports'

describe('仮想実験レポート', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('仮想データであることと注意事項を付けて保存・再読込する', () => {
    const objects = [{
      id: 'virtual-test',
      name: '仮想防災拠点 1',
      createdAt: '2026-11-04T00:00:00.000Z',
      x: 2,
      z: -3,
    }]
    const saved = saveExperiment(objects)
    const loaded = loadExperiments()

    expect(loaded).toHaveLength(1)
    expect(loaded[0]).toEqual(saved)
    expect(loaded[0].dataClassification).toBe('B: 仮想シミュレーションデータ')
    expect(loaded[0].caveat).toContain('示しません')
    expect(loaded[0].virtualObjects[0]).toEqual(objects[0])

    const dataUrl = createExperimentDataUrl(saved)
    const decoded = JSON.parse(decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1)) as string) as unknown
    expect(decoded).toEqual(saved)
  })

  it('不正な保存形式を空データとして扱わず、エラーにする', () => {
    window.localStorage.setItem('disaster-scope.virtual-experiments.v1', '{"unknown":true}')
    expect(() => loadExperiments()).toThrow('保存データの形式が不正です。')
  })
})
