function updateProps(oldVnode, vnode) {
  let oldProps = oldVnode.data.props,
    props = vnode.data.props
  let key,
    cur,
    elem = vnode.elem,
    old

  if (!oldProps && !props) return
  oldProps = oldProps || {}
  props = props || {}

  for (key in oldProps) {
    if (!props[key]) {
      delete elem[key]
    }
  }

  for (key in props) {
    cur = props[key]
    old = props[old]
    if (old !== cur && (key !== 'value' || elem[key] !== cur)) {
      elem[key] = cur
    }
  }
}
module.exports = {
  create: updateProps,
  update: updateProps
}
