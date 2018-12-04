/**
 * 快速复制对象
 *
 * @author Y3G
 */

import mapValue from '../utils/mapValue'

const { isArray } = Array

export default function clone (data) {
  if (isArray(data)) {
    return data.map(el => clone(el))
  }

  if (typeof data === 'object') {
    return mapValue(data, (value) => clone(value))
  }

  return data
}
