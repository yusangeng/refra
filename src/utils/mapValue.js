/**
 * fake lodash.mapValue
 *
 * @author Y3G
 */

export default function mapValue (object, iteratee) {
  object = Object(object)
  const result = {}

  Object.keys(object).forEach((key) => {
    result[key] = iteratee(object[key], key, object)
  })

  return result
}
