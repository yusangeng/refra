/**
 * 安全的Object.defineProperty, 防止babel编译后的代码报错
 *
 * @author Y3G
 */

let originalDefineProperty = null

export function safeDefineProperty (target, key, context) {
  if (target.hasOwnProperty(key)) {
    return
  }

  return originalDefineProperty.call(Object, target, key, context)
}

export function resume () {
  if (!originalDefineProperty) {
    return
  }

  Object.defineProperty = originalDefineProperty
  originalDefineProperty = null
}

export function polyfill () {
  if (!originalDefineProperty) {
    originalDefineProperty = Object.defineProperty
    Object.defineProperty = safeDefineProperty
  }
}
