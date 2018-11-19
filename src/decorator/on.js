export default function on (eventType) {
  return function decorator (target, key, descriptor) {
    if (descriptor.get || descriptor.set) {
      throw new TypeError(`Property should NOT be decorated by @on.`)
    }

    const fn = descriptor.value

    if (!target.__decorated_listeners__) {
      target.__decorated_listeners__ = []
    }

    target.__decorated_listeners__.push({ eventType, callback: fn })

    return descriptor
  }
}
