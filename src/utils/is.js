const Arr = Array.isArray
const primitive = s => {
  return typeof s === 'string' || typeof s === 'number'
}
export default { Arr, primitive }
