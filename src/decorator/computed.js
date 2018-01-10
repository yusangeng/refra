
export default function computed (target, key, descriptor) {
  if (descriptor.set) {
    throw new TypeError(`Computed prop should NOT have setter.`)
  }

  const arr = target.__decorated_computed__ = target.__decorated_computed__ || {}

  if (arr[key]) {
    throw new TypeError(`Duplicate computed prop name: ${key}.`)
  }

  arr[key] = descriptor.get
  return descriptor
}
