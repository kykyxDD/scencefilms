dom = {}

dom.chain = function(animation, callback) {
	callback = 'function' === typeof callback ? callback : f.nop
	var timer, stage = 0
	!function animate() {
		var data = animation[stage++],
			next = stage === animation.length
				? callback : animate
		f.copy(data.element.style, data)
		timer = setTimeout(next, data.duration |0)
	}()
	return function abort() {
		clearTimeout(timer)
	}
}

dom.all = function(selector, root) {
	return [].slice.call((root || document).querySelectorAll(selector))
}

dom.one = function(selector, root) {
	return (root || document).querySelector(selector)
}

dom.elem = function(tag, name, root) {
	var elem = document.createElement(tag)
	if(name) elem.className = name
	if(root) root.appendChild(elem)
	return elem
}

dom.div = function(name, root) {
	return dom.elem('div', name, root)
}

dom.img = function(src, name, root) {
	var img = dom.elem('img', name, root)
	img.src = src
	return img
}

dom.a = function(href, name, root) {
	var a = dom.elem('a', name, root)
	a.href = href
	return a
}

dom.append = function(root, elem) {
	if(root instanceof Node
	&& elem instanceof Node) root.appendChild(elem)
}

dom.prepend = function(root, elem) {
	if(root instanceof Node
	&& elem instanceof Node) root.insertBefore(elem, root.firstChild)
}

dom.insert = function(root, elem, next) {
	if(root instanceof Node
	&& elem instanceof Node
	&& next instanceof Node) root.insertBefore(elem, next)
}

dom.remove = function(elem) {
	elem && elem.parentNode && elem.parentNode.removeChild(elem)
}

dom.empty = function(elem) {
	// can throw Not Found Exception (wtf?) on blur event
	while(elem.firstChild) elem.removeChild(elem.firstChild)
}

dom.children = (function() {
	var _slice = Array.prototype.slice
	function isElement(node) {
		return node.nodeType === Node.ELEMENT_NODE
	}
	return function(elem) {
		return _slice.call(elem.childNodes).filter(isElement)
	}
})()

dom.ancestor = function(child, parent) {
	while(child) {
		if(child === parent) return true
		child = child.parentNode
	}
}

dom.on = function(type, elem, fn, capture) {
	elem.addEventListener(type, fn, !!capture)
}

dom.off = function(type, elem, fn, capture) {
	elem.removeEventListener(type, fn, !!capture)
}

dom.style = function(elem, props) {
	f.copy(elem.style, props)
}

dom.html = function(elem, content) {
	elem.innerHTML = content
}

dom.text = function(elem, content) {
	elem.textContent = content
}

dom.display = function(elem, visible, value) {
	elem.style.display = visible ? value || 'block' : 'none'
}

dom.visible = function(elem, visible) {
	elem.style.visibility = visible ? 'visible' : 'hidden'
}

dom.addclass = function(elem, name) {
	var left = elem.className.split(' ')
	,   right = name.split(' ')

	elem.className = right.concat(left).filter(f.uniqp(true))
	                      .filter(Boolean).join(' ')
}

dom.remclass = function(elem, name) {
	var left = elem.className.split(' ')
	,   right = name.split(' ')

	elem.className = left.concat(right).filter(f.uniqp(false))
	                     .concat(left).filter(f.uniqp(true, true))
	                     .filter(Boolean).join(' ')
}

dom.hasclass = function(elem, name, one) {
	var left = elem.className.split(' ')
	,   right = name.split(' ')

	var found = left.concat(right).filter(f.uniqp(false))
	                .filter(Boolean).length

	return one ? found : found === right.length
}

dom.togclass = function(elem, name, state) {
	if(arguments.length <3) state = !dom.hasclass(elem, name)
	;(state ? dom.addclass : dom.remclass)(elem, name)
}

dom.xstyle = function(elem, name, value) {
	var style = elem.style

	style['-webkit-'+ name] = value
	style[   '-moz-'+ name] = value
	style[    '-ms-'+ name] = value
	style[     '-o-'+ name] = value
	style[            name] = value
}

dom.offset = function(elem) {
	for(var x = 0, y = 0; elem; elem = elem.offsetParent) {
		x += elem.offsetLeft
		y += elem.offsetTop
	}
	return { x: x, y: y }
}

dom.out = function(text) {
	var ta = dom.elem('textarea', null, document.body)
	dom.style(ta, {
		position: 'absolute',
		top: 0, left: 0, right: 0, bottom: 0,
		width: '30%', height: '30%', margin: 'auto'
	})
	dom.text(ta, text)
	ta.focus()
}

dom.ready = function(callback) {
	if('complete' === document.readyState) {
		callback()
	} else {
		document.addEventListener('DOMContentLoaded', complete)
		window.addEventListener('load', complete)
	}
	function complete() {
		document.removeEventListener('DOMContentLoaded', complete)
		window.removeEventListener('load', complete)
		callback()
	}
}
