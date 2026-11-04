import type { VirtualFacility } from './demo'

const storageKey = 'disaster-scope.virtual-experiments.v1'

export interface ExperimentReport {
  id: string
  name: string
  createdAt: string
  dataClassification: 'B: 仮想シミュレーションデータ'
  region: string
  caveat: string
  virtualObjects: VirtualFacility[]
}

export function createExperimentDataUrl(report: ExperimentReport): string {
  const json = JSON.stringify(report, null, 2)
  return `data:application/json;charset=utf-8,${encodeURIComponent(json)}`
}

function isVirtualFacility(value: unknown): value is VirtualFacility {
  if (typeof value !== 'object' || value === null) return false
  const facility = value as Record<string, unknown>
  return typeof facility.id === 'string'
    && typeof facility.name === 'string'
    && typeof facility.createdAt === 'string'
    && typeof facility.x === 'number'
    && Number.isFinite(facility.x)
    && typeof facility.z === 'number'
    && Number.isFinite(facility.z)
}

function isExperimentReport(value: unknown): value is ExperimentReport {
  if (typeof value !== 'object' || value === null) return false
  const report = value as Record<string, unknown>
  return typeof report.id === 'string'
    && typeof report.name === 'string'
    && typeof report.createdAt === 'string'
    && report.dataClassification === 'B: 仮想シミュレーションデータ'
    && typeof report.region === 'string'
    && typeof report.caveat === 'string'
    && Array.isArray(report.virtualObjects)
    && report.virtualObjects.every(isVirtualFacility)
}

export function loadExperiments(): ExperimentReport[] {
  const raw = window.localStorage.getItem(storageKey)
  if (raw === null) return []

  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || !parsed.every(isExperimentReport)) {
    throw new Error('保存データの形式が不正です。')
  }
  return parsed
}

export function saveExperiment(virtualObjects: VirtualFacility[]): ExperimentReport {
  const createdAt = new Date().toISOString()
  const report: ExperimentReport = {
    id: `demo-experiment-${Date.now()}`,
    name: `仮想防災配置 ${new Date(createdAt).toLocaleString('ja-JP')}`,
    createdAt,
    dataClassification: 'B: 仮想シミュレーションデータ',
    region: '仮想デモ空間（宇和島市の実測データではありません）',
    caveat: '教育用の仮想データです。実際の災害状況、施設容量、避難時間、経路の安全性を示しません。',
    virtualObjects: virtualObjects.map((object) => ({ ...object })),
  }
  const reports = loadExperiments()
  window.localStorage.setItem(storageKey, JSON.stringify([report, ...reports]))
  return report
}
