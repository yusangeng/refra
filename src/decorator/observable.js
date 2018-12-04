import computed from './computed'

export default function observable (target, key, descriptor) {
  if (descriptor.get) {
    // 计算属性
    return computed(target, key, descriptor)
  }

  if (!target.__decorated_props__) {
    target.__decorated_props__ = {}
  }

  target.__decorated_props__[key] = descriptor.initializer
  descriptor.configurable = true

  return descriptor
}
