const Arr = Array.isArray
const primitive = s => {
  return typeof s === 'string' || typeof s === 'number'
}
const unDef = s => s === undefined
const Def = s => s !== undefined

export default { Arr, primitive, unDef, Def }
