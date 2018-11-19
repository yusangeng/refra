export default function prop (target, key, descriptor) {
  if (!target.__decorated_props__) {
    target.__decorated_props__ = {}
  }

  target.__decorated_props__[key] = descriptor.initializer()
  descriptor.configurable = true

  return descriptor
}
