
export default function decoratorReaction (target, key, descriptor) {
  if (descriptor.get || descriptor.set) {
    throw new TypeError(`Property should NOT be decorated by @reaction.`)
  }

  const fn = descriptor.value
  const reactions = target.__decorated_reactions__ = target.__decorated_reactions__ || []

  reactions.push(fn)
  return descriptor
}
