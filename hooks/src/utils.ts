import cover from '@mapbox/tile-cover'
import { MAX_ZOOM, MIN_ZOOM } from './config'
import { GeoJSON } from 'geojson'

export const geojsonToTiles = (geojson?: GeoJSON) => {
  const walkTiles = (geojson: GeoJSON, tiles: number[][] = []) => {
    if (geojson.type === 'FeatureCollection') {
      for (const feature of geojson.features) {
        walkTiles(feature, tiles)
      }
    } else if (geojson.type === 'Feature') {
      walkTiles(geojson.geometry, tiles)
    } else if (geojson.type === 'GeometryCollection') {
      for (const geometry of geojson.geometries) {
        walkTiles(geometry, tiles)
      }
    } else {
      let maxZoomCursor = MAX_ZOOM
      let tilesCursor: number[][] = []
      do {
        tilesCursor = cover.tiles(geojson, {
          min_zoom: 1,
          max_zoom: maxZoomCursor
        })
        // TODO filter out any tile that is already in the tiles array
        tiles.push(...tilesCursor)
        maxZoomCursor--
      } while (
        (tilesCursor.length > 1 || geojson.type === 'Point') &&
        maxZoomCursor > MIN_ZOOM
      )
    }
  }
  // * Generate the tiles list
  console.log(` [*] Calculating tiles coordinates of the Area of Internet...`)
  const tiles: number[][] = []
  if (geojson) walkTiles(geojson, tiles)
  console.log(` [*] Found ${tiles.length} tiles.`)
  return tiles
}
