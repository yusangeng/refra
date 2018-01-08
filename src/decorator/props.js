
import clone from 'clone'

export default function decoratedProps (props) {
  return function decorator (target) {
    target.__decorated_props__ = clone(props)
  }
}
