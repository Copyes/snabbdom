const VNODE_TYPE = Symbol('virtual-node')
// 判断是不是相似节点
const isSameNode = (oldNode, newNode) => {
  return oldNode.key === newNode.key && oldNode.sel === newNode.sel
}
// 用于判断该节点是不是虚拟节点
const isVnode = vnode => {
  return vnode && vnode._type === VNODE_TYPE
}
// 虚拟节点的对象主要包含的字段
const vnode = (sel, data, children, text, elem) => {
  let key = data === undefined ? undefined : data.key
  return {
    _type: VNODE_TYPE,
    sel,
    data,
    children,
    text,
    elem,
    key
  }
}
export default vnode
export { isSameNode, isVnode }
