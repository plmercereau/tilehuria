import Vue from 'vue'
import { format } from 'quasar'
const { humanStorageSize } = format

Vue.filter('prettyBytes', function(num: number) {
  return humanStorageSize(num)
})
