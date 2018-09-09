/**
 * 判断是否是string
 *
 * @author Y3G
 */

export default function isString (o) {
  return Object.prototype.toString.call(o) === '[object String]'
}
