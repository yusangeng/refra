
const { assign } = Object

function decorateUndisposedMethod (target, key, descriptor) {
  const method = descriptor.value
  const ret = assign({}, descriptor, {
    value: function (...params) {
      this.assertUndisposed(key)
      return method.apply(this, params)
    }
  })

  return ret
}

function decorateUndisposedProperty (target, key, descriptor) {
  const getter = descriptor.get
  const setter = descriptor.set

  const ret = assign({}, descriptor, {
    getter: getter ? function (...params) {
      this.assertUndisposed(`${key} getter`)
      return getter.apply(this, params)
    } : void 0,

    setter: setter ? function (...params) {
      this.assertUndisposed(`${key} setter`)
      return setter.apply(this, params)
    } : void 0
  })

  return ret
}

export default function decorateUndisposed (target, key, descriptor) {
  if (descriptor.get || descriptor.set) {
    return decorateUndisposedProperty(target, key, descriptor)
  }

  return decorateUndisposedMethod(target, key, descriptor)
}

