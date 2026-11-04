export type GeoJsonPosition = [number, number, ...number[]]

export interface GeoJsonGeometry {
  type: string
  coordinates?: unknown
  geometries?: GeoJsonGeometry[]
}

export interface GeoJsonFeature {
  type: 'Feature'
  id?: string | number
  properties: Record<string, unknown> | null
  geometry: GeoJsonGeometry | null
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

export type GeoLayerCategory = 'flood' | 'shelters' | 'roads' | 'buildings' | 'other'

export interface GeoBounds {
  west: number
  south: number
  east: number
  north: number
}

export interface GeoJsonSummary {
  collection: GeoJsonFeatureCollection
  featureCount: number
  coordinateCount: number
  geometryCounts: Record<string, number>
  bounds: GeoBounds
  propertyKeys: string[]
}

export interface GeoLayerRecord {
  id: string
  name: string
  category: GeoLayerCategory
  sourceName: string
  sourceUrl: string
  acquiredAt: string
  dataUpdatedAt: string
  licenseNote: string
  licenseReviewed: boolean
  fileName: string
  byteSize: number
  featureCount: number
  coordinateCount: number
  geometryCounts: Record<string, number>
  bounds: GeoBounds
  propertyKeys: string[]
  importedAt: string
  crs: 'OGC:CRS84'
  collection: GeoJsonFeatureCollection
}

export const MAX_GEOJSON_BYTES = 20 * 1024 * 1024
export const MAX_GEOJSON_FEATURES = 50_000
export const MAX_GEOJSON_COORDINATES = 500_000

const GEOMETRY_TYPES = new Set([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPosition(value: unknown): value is number[] {
  return Array.isArray(value)
    && value.length >= 2
    && typeof value[0] === 'number'
    && typeof value[1] === 'number'
}

function collectPositions(value: unknown, output: GeoJsonPosition[]): void {
  if (!Array.isArray(value)) return
  if (isPosition(value)) {
    const [longitude, latitude, ...rest] = value
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      throw new Error('座標に有限の数値ではない値が含まれています。')
    }
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      throw new Error('経度・緯度の範囲外の座標が含まれています。WGS84（経度・緯度）へ変換してください。')
    }
    if (rest.some((number) => typeof number !== 'number' || !Number.isFinite(number))) {
      throw new Error('座標の高さなどに不正な数値が含まれています。')
    }
    output.push([longitude, latitude, ...rest])
    if (output.length > MAX_GEOJSON_COORDINATES) {
      throw new Error('座標数が上限を超えています。対象地域を分割して読み込んでください。')
    }
    return
  }
  for (const child of value) collectPositions(child, output)
}

function collectGeometryPositions(geometry: GeoJsonGeometry, output: GeoJsonPosition[]): void {
  if (!GEOMETRY_TYPES.has(geometry.type)) {
    throw new Error(`未対応のジオメトリ形式です: ${geometry.type || '不明'}`)
  }
  if (geometry.type === 'GeometryCollection') {
    if (!Array.isArray(geometry.geometries)) {
      throw new Error('GeometryCollectionのgeometriesが不正です。')
    }
    for (const child of geometry.geometries) {
      if (!isRecord(child) || typeof child.type !== 'string') {
        throw new Error('GeometryCollection内に不正なジオメトリがあります。')
      }
      collectGeometryPositions(child as GeoJsonGeometry, output)
    }
    return
  }
  collectPositions(geometry.coordinates, output)
}

function normalizeInput(input: unknown): GeoJsonFeatureCollection {
  if (!isRecord(input) || typeof input.type !== 'string') {
    throw new Error('GeoJSONのtypeが見つかりません。')
  }

  // Legacy GeoJSON may contain an explicit CRS. Only accept declarations that
  // clearly identify longitude/latitude WGS84-compatible coordinates.
  if (input.crs !== undefined) {
    const crs = input.crs
    const properties = isRecord(crs) && isRecord(crs.properties) ? crs.properties : null
    const name = properties && typeof properties.name === 'string' ? properties.name : ''
    if (!/4326|CRS84/i.test(name)) {
      throw new Error('このファイルの座標系を確認できません。WGS84（OGC:CRS84 / 経度・緯度）に変換してから読み込んでください。')
    }
  }

  if (input.type === 'FeatureCollection') {
    if (!Array.isArray(input.features)) {
      throw new Error('FeatureCollectionのfeaturesが配列ではありません。')
    }
    if (input.features.length === 0) {
      throw new Error('GeoJSONに地物がありません。')
    }
    return {
      type: 'FeatureCollection',
      features: input.features.map((feature, index) => normalizeFeature(feature, index)),
    }
  }

  if (input.type === 'Feature') {
    return { type: 'FeatureCollection', features: [normalizeFeature(input, 0)] }
  }

  if (GEOMETRY_TYPES.has(input.type)) {
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { name: 'GeoJSON geometry' },
        geometry: input as unknown as GeoJsonGeometry,
      }],
    }
  }

  throw new Error('FeatureCollection、Feature、または対応するGeometry形式のGeoJSONを指定してください。')
}

function normalizeFeature(value: unknown, index: number): GeoJsonFeature {
  if (!isRecord(value) || value.type !== 'Feature') {
    throw new Error(`features[${index}] がGeoJSON Featureではありません。`)
  }
  const rawProperties = value.properties
  const properties = rawProperties === null || rawProperties === undefined
    ? null
    : isRecord(rawProperties) ? rawProperties : null
  const geometry = value.geometry === null || value.geometry === undefined
    ? null
    : isRecord(value.geometry) && typeof value.geometry.type === 'string'
      ? value.geometry as GeoJsonGeometry
      : null
  if (value.geometry !== null && value.geometry !== undefined && geometry === null) {
    throw new Error(`features[${index}] のgeometryが不正です。`)
  }
  return {
    type: 'Feature',
    ...(typeof value.id === 'string' || typeof value.id === 'number' ? { id: value.id } : {}),
    properties,
    geometry,
  }
}

export function parseGeoJsonText(text: string): GeoJsonSummary {
  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    throw new Error('JSONを解析できません。ファイル形式と文字コードを確認してください。')
  }

  const collection = normalizeInput(parsed)
  if (collection.features.length > MAX_GEOJSON_FEATURES) {
    throw new Error(`地物数が上限（${MAX_GEOJSON_FEATURES.toLocaleString('ja-JP')}件）を超えています。`)
  }

  const positions: GeoJsonPosition[] = []
  const geometryCounts: Record<string, number> = {}
  const propertyKeys = new Set<string>()

  for (const feature of collection.features) {
    if (feature.geometry) {
      geometryCounts[feature.geometry.type] = (geometryCounts[feature.geometry.type] ?? 0) + 1
      collectGeometryPositions(feature.geometry, positions)
    }
    for (const key of Object.keys(feature.properties ?? {})) propertyKeys.add(key)
  }

  if (positions.length === 0) {
    throw new Error('有効な座標を持つ地物がありません。')
  }

  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity
  for (const position of positions) {
    west = Math.min(west, position[0])
    south = Math.min(south, position[1])
    east = Math.max(east, position[0])
    north = Math.max(north, position[1])
  }
  return {
    collection,
    featureCount: collection.features.length,
    coordinateCount: positions.length,
    geometryCounts,
    bounds: { west, south, east, north },
    propertyKeys: [...propertyKeys].sort().slice(0, 100),
  }
}

export function getFeaturePositions(feature: GeoJsonFeature): GeoJsonPosition[] {
  const positions: GeoJsonPosition[] = []
  if (feature.geometry) collectGeometryPositions(feature.geometry, positions)
  return positions
}

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const GEO_CATEGORY_LABELS: Record<GeoLayerCategory, string> = {
  flood: '洪水・浸水想定',
  shelters: '避難場所・避難所',
  roads: '道路',
  buildings: '建物',
  other: 'その他',
}
