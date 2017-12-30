const updateClass = (oldNode, vnode) => {
  let cur,
    name,
    elem = vnode.elem,
    oldClass = oldNode.data.class,
    newClass = vnode.data.class
  //如果旧节点和新节点都没有class，直接返回
  if (!oldClass && !newClass) return
  oldClass = oldClass || {}
  newClass = newClass || {}
  //从旧节点中删除新节点不存在的类
  for (name in oldClass) {
    if (!newClass[name]) {
      elem.classList.remove(name)
    }
  }
  //如果新节点中对应旧节点的类不存在，则删除该类，如果新设置存在，则添加该类
  for (name in newClass) {
    cur = newClass[name]
    if (cur !== oldClass[name]) {
      elem.classList[cur ? 'add' : 'remove'](name)
    }
  }
}

export default {
  create: updateClass,
  update: updateClass
}
