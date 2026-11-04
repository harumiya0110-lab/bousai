import {
  MAX_GEOJSON_FEATURES,
  type GeoJsonFeatureCollection,
  type GeoJsonFeature,
} from './geojson'


export type CsvEncoding = 'UTF-8' | 'Shift_JIS'

export interface DecodedCsv {
  text: string
  encoding: CsvEncoding
}

/**
 * Detect UTF-8 strictly, then fall back to Shift_JIS (Windows-31J mapping
 * in modern browsers) for Japanese municipal open-data CSV files.
 */
export function decodeCsvBytes(buffer: ArrayBuffer): DecodedCsv {
  try {
    return {
      text: new TextDecoder('utf-8', { fatal: true }).decode(buffer),
      encoding: 'UTF-8',
    }
  } catch {
    try {
      return {
        text: new TextDecoder('shift_jis', { fatal: true }).decode(buffer),
        encoding: 'Shift_JIS',
      }
    } catch {
      throw new Error('CSVの文字コードを判定できません。UTF-8またはShift_JIS形式で保存し直してください。')
    }
  }
}

export interface CsvTable {
  headers: string[]
  rows: string[][]
}

export interface CsvGeoJsonResult {
  collection: GeoJsonFeatureCollection
  importedRows: number
  skippedRows: number
  longitudeColumn: string
  latitudeColumn: string
}

const MAX_CSV_COLUMNS = 200

export function parseCsvText(input: string): CsvTable {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += character
      }
      continue
    }

    if (character === '"' && field.length === 0) {
      inQuotes = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((cell) => cell.trim().length > 0)) rows.push(row)
      row = []
      field = ''
      if (rows.length > MAX_GEOJSON_FEATURES + 1) {
        throw new Error('CSVのデータ行数が上限（50,000件）を超えています。対象地域を分割してください。')
      }
    } else {
      field += character
    }
  }

  if (inQuotes) throw new Error('CSVの引用符が閉じられていません。ファイルの形式を確認してください。')
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((cell) => cell.trim().length > 0)) rows.push(row)
  }
  if (rows.length < 2) throw new Error('CSVにヘッダーとデータ行が必要です。')

  const rawHeaders = rows.shift() ?? []
  if (rawHeaders.length === 0 || rawHeaders.length > MAX_CSV_COLUMNS) {
    throw new Error('CSVの列数が不正です（最大200列）。')
  }
  const seen = new Map<string, number>()
  const headers = rawHeaders.map((header, index) => {
    const clean = header.trim() || '列' + (index + 1)
    const occurrence = (seen.get(clean) ?? 0) + 1
    seen.set(clean, occurrence)
    return occurrence === 1 ? clean : clean + ' (' + occurrence + ')'
  })

  const dataRows = rows.map((cells, rowIndex) => {
    if (cells.length > headers.length) {
      throw new Error('CSVの' + (rowIndex + 2) + '行目にヘッダーより多い列があります。引用符や区切り文字を確認してください。')
    }
    return [...cells, ...Array.from({ length: headers.length - cells.length }, () => '')]
  })

  if (dataRows.length > MAX_GEOJSON_FEATURES) {
    throw new Error('CSVのデータ行数が上限（50,000件）を超えています。対象地域を分割してください。')
  }

  return { headers, rows: dataRows }
}

export function detectCoordinateColumns(headers: string[]): {
  longitudeColumn: string
  latitudeColumn: string
} {
  const longitude = headers.find((header) => /^(経度|longitude|lon)$/i.test(header.trim()))
    ?? headers.find((header) => /経度|longitude/i.test(header))
  const latitude = headers.find((header) => /^(緯度|latitude|lat)$/i.test(header.trim()))
    ?? headers.find((header) => /緯度|latitude/i.test(header))
  return { longitudeColumn: longitude ?? '', latitudeColumn: latitude ?? '' }
}

function parseCoordinate(value: string, minimum: number, maximum: number): number | null {
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) return null
  return parsed
}

export function csvToGeoJson(
  table: CsvTable,
  longitudeColumn: string,
  latitudeColumn: string,
): CsvGeoJsonResult {
  if (!table.headers.includes(longitudeColumn) || !table.headers.includes(latitudeColumn)) {
    throw new Error('経度列と緯度列を選択してください。')
  }
  if (longitudeColumn === latitudeColumn) {
    throw new Error('経度列と緯度列には異なる列を指定してください。')
  }

  const longitudeIndex = table.headers.indexOf(longitudeColumn)
  const latitudeIndex = table.headers.indexOf(latitudeColumn)
  const features: GeoJsonFeature[] = []
  let skippedRows = 0

  table.rows.forEach((row, rowIndex) => {
    const longitude = parseCoordinate(row[longitudeIndex] ?? '', -180, 180)
    const latitude = parseCoordinate(row[latitudeIndex] ?? '', -90, 90)
    if (longitude === null || latitude === null) {
      skippedRows += 1
      return
    }

    const properties: Record<string, unknown> = {}
    table.headers.forEach((header, index) => {
      properties[header] = row[index] ?? ''
    })

    features.push({
      type: 'Feature',
      id: String(rowIndex + 2),
      properties,
      geometry: { type: 'Point', coordinates: [longitude, latitude] },
    })
  })

  if (features.length === 0) {
    throw new Error('有効な緯度・経度を持つ行がありません。列の指定と座標系を確認してください。')
  }

  return {
    collection: { type: 'FeatureCollection', features },
    importedRows: features.length,
    skippedRows,
    longitudeColumn,
    latitudeColumn,
  }
}
