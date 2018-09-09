/**
 * 异步任务
 *
 * @author Y3G
 */

const isSetTimeout = (typeof Promise === 'undefined') || !Promise.toString().includes('[native code]')

function then (fn) {
  new Promise(resolve => resolve()).then(fn)
}

export function microTask (fn) {
  return (...params) => then(_ => fn(...params))
}

export function macroTask (fn) {
  if (isSetTimeout) {
    return (...params) => setTimeout(_ => {
      setTimeout(_ => fn(...params), 0)
    }, 0)
  }

  return (...params) => setTimeout(_ => fn(...params), 0)
}
