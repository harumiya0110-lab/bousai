import { describe, expect, it } from 'vitest'
import { csvToGeoJson, detectCoordinateColumns, parseCsvText } from './csv'

describe('CSV import', () => {
  it('BOM付きUTF-8・CRLF・引用符内カンマを処理する', () => {
    const table = parseCsvText('\uFEFF名称,住所,経度,緯度\r\n"宇和島,学校","愛媛県宇和島市",132.5,33.2\r\n')
    expect(table.headers).toEqual(['名称', '住所', '経度', '緯度'])
    expect(table.rows[0][0]).toBe('宇和島,学校')
  })

  it('引用符内の改行と二重引用符を処理する', () => {
    const table = parseCsvText('name,note,lon,lat\n"避難所","説明 ""重要""\n2行目",132.5,33.2')
    expect(table.rows[0][1]).toBe('説明 "重要"\n2行目')
  })

  it('経度・緯度列を日本語と英語の見出しから検出する', () => {
    expect(detectCoordinateColumns(['施設名', '経度', '緯度'])).toEqual({
      longitudeColumn: '経度',
      latitudeColumn: '緯度',
    })
    expect(detectCoordinateColumns(['name', 'longitude', 'latitude'])).toEqual({
      longitudeColumn: 'longitude',
      latitudeColumn: 'latitude',
    })
  })

  it('緯度経度をポイントGeoJSONへ変換して元の属性を保持する', () => {
    const table = parseCsvText('施設名,住所,経度,緯度\n学校,宇和島市,132.5,33.2\n公民館,宇和島市,132.6,33.3')
    const result = csvToGeoJson(table, '経度', '緯度')
    expect(result.importedRows).toBe(2)
    expect(result.skippedRows).toBe(0)
    expect(result.collection.features[0].geometry?.coordinates).toEqual([132.5, 33.2])
    expect(result.collection.features[0].properties?.['施設名']).toBe('学校')
  })

  it('欠損・範囲外の座標行を除外して件数を返す', () => {
    const table = parseCsvText('name,lon,lat\nA,132.5,33.2\nB,,33.3\nC,250,33.4')
    const result = csvToGeoJson(table, 'lon', 'lat')
    expect(result.importedRows).toBe(1)
    expect(result.skippedRows).toBe(2)
  })

  it('閉じられていない引用符を拒否する', () => {
    expect(() => parseCsvText('name,lon,lat\n"bad,132.5,33.2')).toThrow(/引用符/)
  })

  it('有効な座標がないCSVを拒否する', () => {
    const table = parseCsvText('name,lon,lat\nA,,\n')
    expect(() => csvToGeoJson(table, 'lon', 'lat')).toThrow(/有効な緯度・経度/)
  })
})
