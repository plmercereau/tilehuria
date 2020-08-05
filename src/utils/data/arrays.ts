import deepEqual from 'deep-equal'

export const difference = <T extends Record<string, unknown>>(
  initial: T[] | Readonly<T[]>,
  minus: T[] | Readonly<T[]>,
  equals: (a: T, b: T) => boolean = deepEqual
): T[] =>
  initial.filter(
    initialElement =>
      !minus.some(minusElement => equals(initialElement, minusElement))
  )

export const intersection = <T extends Record<string, unknown>>(
  a: T[] | Readonly<T[]>,
  b: T[] | Readonly<T[]>,
  equals: (a: T, b: T) => boolean = deepEqual
): T[] => a.filter(elementA => b.some(elementB => equals(elementA, elementB)))

/**
 * @param initial
 * @param update
 * @param hasSameId
 */
export const arrayChanges = <T extends Record<string, unknown>>(
  initial: T[] | Readonly<T[]>,
  update: T[] | Readonly<T[]>,
  hasSameId: (a: T, b: T) => boolean
) => ({
  add: difference(update, initial, hasSameId),
  remove: difference(initial, update, hasSameId),
  update: intersection(
    initial,
    update,
    (a, b) => hasSameId(a, b) && !deepEqual(a, b)
  )
})
