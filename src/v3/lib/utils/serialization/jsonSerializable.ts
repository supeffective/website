const serialize = <T = any>(value: any): T => {
  if (value instanceof Date) {
    return { _type: 'Date', _value: value.toISOString() } as T
  }

  if (value instanceof Map) {
    return {
      _type: 'Map',
      _value: Array.from(value.entries()).map(([key, value]) => [serialize(key), serialize(value)]),
    } as T
  }

  if (value instanceof Set) {
    return {
      _type: 'Set',
      _value: Array.from(value).map(serialize),
    } as T
  }

  if (Array.isArray(value)) {
    return value.map(serialize) as T
  }

  if (value instanceof Object) {
    return Object.entries(value).reduce((acc: any, [key, value]) => {
      acc[key] = serialize(value)
      return acc
    }, {})
  }
  return value
}

function deserialize<T = any>(value: any): T {
  if (Array.isArray(value)) {
    return value.map(deserialize) as T
  }
  if (value instanceof Object) {
    if (value._type === 'Date') {
      return new Date(value._value) as T
    }

    if (value._type === 'Map') {
      return new Map(value._value.map(([key, value]: any) => [deserialize(key), deserialize(value)])) as T
    }

    if (value._type === 'Set') {
      return new Set(value._value.map(deserialize)) as T
    }

    return Object.entries(value).reduce((acc: any, [key, value]) => {
      acc[key] = deserialize(value)
      return acc
    }, {})
  }
  return value
}

export function serializeJson(value: any): string {
  return JSON.stringify(serialize(value))
}

export function deserializeJson<T = any>(value: string): T {
  return deserialize(JSON.parse(value))
}

export const jsonEncode = serializeJson
export const jsonDecode = deserializeJson

export { deserialize as deserializeObject, serialize as serializeObject }

export type SerializableDate = { _type: 'Date'; _value: string }
export type SerializableMap = { _type: 'Map'; _value: [any, any][] }
export type SerializableSet = { _type: 'Set'; _value: any[] }
