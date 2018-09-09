import clone from '../utils/clone'

export default function props (props) {
  return function decorator (target) {
    target.__decorated_props__ = clone(props)
  }
}
