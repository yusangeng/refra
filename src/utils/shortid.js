/**
 * shortid的简单实现(只能保证同一个页面中的唯一性)
 *
 * @author Y3G
 */

let CURRENT_ID = Number.MIN_SAFE_INTEGER

export default function shortid () {
  return `id-${Date.now()}-${CURRENT_ID++}`
}
