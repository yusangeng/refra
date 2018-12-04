export default function connection (target, key, descriptor) {
  if (!target.__decorated_children__) {
    target.__decorated_children__ = {}
  }

  target.__decorated_children__[key] = descriptor.initializer
  descriptor.configurable = true

  return descriptor
}
