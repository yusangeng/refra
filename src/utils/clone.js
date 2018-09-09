/**
 * 快速复制对象
 *
 * @author Y3G
 */

export default function clone (val) {
  if (Array.isArray(val)) {
    return val.slice()
  }

  if (typeof val === 'object') {
    return Object.assign({}, val)
  }

  return val
}
