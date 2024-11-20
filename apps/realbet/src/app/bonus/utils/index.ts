import { camelCase } from 'lodash';

export const shorten = (address: string, size = 6) =>
  address.slice(0, size) + '...' + address.slice(-size);

export const toCamel = (o: unknown): unknown => {
  if (Array.isArray(o)) {
    return o.map((value: unknown) => {
      return toCamel(value);
    });
  } else if (typeof o === 'object' && o !== null) {
    const obj = o as Record<string, unknown>;
    const newObject: Record<string, unknown> = {};
    for (const originalKey in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, originalKey)) {
        const newKey = camelCase(originalKey);
        let value = obj[originalKey];
        if (
          Array.isArray(value) ||
          (typeof value === 'object' && value !== null)
        ) {
          value = toCamel(value);
        }
        newObject[newKey] = value;
      }
    }

    return newObject;
  }

  return o;
};
