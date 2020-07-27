/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { boot } from 'quasar/wrappers'
import Vue from 'vue'
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LGeoJson,
  LControl
} from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

import { Icon } from 'leaflet'

type D = Icon.Default & {
  _getIconUrl: string
}
delete (Icon.Default.prototype as D)._getIconUrl

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default boot(() => {
  Vue.component('l-map', LMap)
  Vue.component('l-tile-layer', LTileLayer)
  Vue.component('l-geo-json', LGeoJson)

  Vue.component('l-marker', LMarker)
  Vue.component('l-popup', LPopup)
  Vue.component('l-tooltip', LTooltip)
  Vue.component('l-control', LControl)
})
