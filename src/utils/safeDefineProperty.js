let originalDefineProperty = null

export function safeDefineProperty (target, key, context) {
  // console.log('safeDefineProperty', key)
  if (target.hasOwnProperty(key)) {
    // console.log('quit safeDefineProperty', target[key])
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
