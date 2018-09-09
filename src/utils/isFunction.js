/**
 * 判断是否是function
 *
 * @author Y3G
 */

export default function isFunction (o) {
  return Object.prototype.toString.call(o) === '[object Function]'
}
