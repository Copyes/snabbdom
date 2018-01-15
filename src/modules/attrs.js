const booleanAttrs = [
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'compact',
  'controls',
  'declare',
  'default',
  'defaultchecked',
  'defaultmuted',
  'defaultselected',
  'defer',
  'disabled',
  'draggable',
  'enabled',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'pauseonexit',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'selected',
  'sortable',
  'spellcheck',
  'translate',
  'truespeed',
  'typemustmatch',
  'visible'
]

let booleanAttrsDict = Object.create(null)
for (let i = 0; i < booleanAttrs.length; ++i) {
  booleanAttrsDict[booleanAttrs[i]] = true
}

function updateAttrs(oldVnode, vnode) {
  let key,
    cur,
    old,
    elem = vnode.elem
  attrs = vnode.data.attrs
  oldAttrs = oldVnode.data.attrs
  if (!oldAttrs && !attrs) return
  oldAttrs = oldAttrs || {}
  attrs = attrs || {}

  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (cur !== old) {
      if (!cur && booleanAttrsDict[key]) {
        elem.removeAttribute(key)
      } else {
        elem.setAttribute(key, cur)
      }
    }
  }

  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elem.removeAttribute(key)
    }
  }
}

module.exports = {
  create: updateAttrs,
  update: updateAttrs
}