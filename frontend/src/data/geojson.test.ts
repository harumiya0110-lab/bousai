import { describe, expect, it } from 'vitest'
import { formatByteSize, parseGeoJsonText } from './geojson'

describe('GeoJSON validation', () => {
  it('UTF-8 BOM付きGeoJSONを読み込める', () => {
    const result = parseGeoJsonText('\\uFEFF' + JSON.stringify({
      type: 'Feature',
      properties: { name: 'BOM test' },
      geometry: { type: 'Point', coordinates: [132.5, 33.2] },
    }))
    expect(result.featureCount).toBe(1)
    expect(result.propertyKeys).toContain('name')
  })

  it('FeatureCollectionの座標・属性・範囲を集計する', () => {
    const input = JSON.stringify({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { name: 'sample road', kind: 'road' },
        geometry: { type: 'LineString', coordinates: [[132.5, 33.2], [132.6, 33.3]] },
      }],
    })
    const result = parseGeoJsonText(input)
    expect(result.featureCount).toBe(1)
    expect(result.coordinateCount).toBe(2)
    expect(result.bounds.west).toBe(132.5)
    expect(result.bounds.north).toBe(33.3)
    expect(result.propertyKeys).toContain('name')
  })

  it('単一FeatureをFeatureCollectionへ正規化する', () => {
    const result = parseGeoJsonText(JSON.stringify({
      type: 'Feature',
      properties: null,
      geometry: { type: 'Point', coordinates: [132.5, 33.2] },
    }))
    expect(result.collection.type).toBe('FeatureCollection')
    expect(result.featureCount).toBe(1)
  })

  it('不正な座標範囲を拒否する', () => {
    expect(() => parseGeoJsonText(JSON.stringify({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [250, 33] },
    }))).toThrow(/範囲外/)
  })

  it('不明なCRSを推測せず拒否する', () => {
    expect(() => parseGeoJsonText(JSON.stringify({
      type: 'FeatureCollection',
      crs: { type: 'name', properties: { name: 'EPSG:6677' } },
      features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [132, 33] } }],
    }))).toThrow(/座標系/)
  })


  it('LineStringに最低2点がない場合は拒否する', () => {
    expect(() => parseGeoJsonText(JSON.stringify({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: [[132.5, 33.2]] },
    }))).toThrow(/LineString/)
  })

  it('閉じたPolygonのリングを検証する', () => {
    const result = parseGeoJsonText(JSON.stringify({
      type: 'Feature',
      properties: { name: 'sample area' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[132.5, 33.2], [132.6, 33.2], [132.6, 33.3], [132.5, 33.3], [132.5, 33.2]]],
      },
    }))
    expect(result.geometryCounts.Polygon).toBe(1)
    expect(result.coordinateCount).toBe(5)
  })

  it('始点と終点が一致しないPolygonリングは拒否する', () => {
    expect(() => parseGeoJsonText(JSON.stringify({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[132.5, 33.2], [132.6, 33.2], [132.6, 33.3], [132.5, 33.3]]],
      },
    }))).toThrow(/始点と終点/)
  })

  it('GeometryCollection内の地物を検証する', () => {
    const result = parseGeoJsonText(JSON.stringify({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'GeometryCollection',
        geometries: [
          { type: 'Point', coordinates: [132.5, 33.2] },
          { type: 'LineString', coordinates: [[132.5, 33.2], [132.6, 33.3]] },
        ],
      },
    }))
    expect(result.coordinateCount).toBe(3)
  })

  it('人間が読みやすいファイルサイズを返す', () => {
    expect(formatByteSize(1536)).toBe('1.5 KB')
    expect(formatByteSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})
