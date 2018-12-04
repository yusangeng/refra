/**
 * Fake lodash.mapvalues
 *
 * @author Y3G
 */

const { keys } = Object

export default function mapValue (object, iteratee) {
  object = Object(object)
  const result = {}

  keys(object).forEach((key) => {
    result[key] = iteratee(object[key], key, object)
  })

  return result
}
