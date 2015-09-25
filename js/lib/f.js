f = {}

f.nop = function() {}

f.sum = function(a, b) {
	return a + b
}

f.numeric = function(name) {
	return function(a, b) {
		return a && b ? a[name] - b[name] : -1
	}
}

f.max = function(array) {
	return Math.max.apply(0, array)
}

f.min = function(array) {
	return Math.min.apply(0, array)
}

f.apick = function(array, name, value) {
	for(var i = 0, l = array.length, item; i < l; i++) {
		item = array[i]
		if(item && item[name] === value) return item
	}
}

f.aselect = function(array, name, value) {
	for(var i = 0, l = array.length, item, r = []; i < l; i++) {
		item = array[i]
		if(item && item[name] === value) r.push(item)
	}
	return r
}

f.adrop = function(array, item) {
	var index = array.indexOf(item)
	if(~index) array.splice(index, 1)
}

f.asub = function(array, sub) {
	for(var i = 0, l = array.length, ret = [], item; i < l; i++) {
		item = array[i]
		if(!~sub.indexOf(item)) ret.push(item)
	}
	return ret
}

f.aflat = function(array) {
	return [].concat.apply([], array)
}

f.clamp = function(num, min, max) {
	return num < min ? min : num > max ? max : num
}

f.uniq = function(e, i, a) {
	return a.indexOf(e) === i
}

f.uniqp = function(invert, dropMultiple) {
	return function(e, i, a) {
		return !invert ^ (a.indexOf(e) === (dropMultiple ? a.lastIndexOf(e) : i))
	}
}

f.rand = function(num) {
	return Math.random() * (+num || 1) |0
}

f.any = function(array) {
	return array[f.rand(array.length)]
}

f.exp = function(val) {
	var exp  = 0
	,   absv = Math.abs(val)

	if(absv === 0
	|| absv === Infinity
	|| absv === NaN) return absv

	if(absv < 1) for(; Math.pow(10, exp    ) >  absv; exp--);
	else         for(; Math.pow(10, exp + 1) <= absv; exp++);
	return exp
}

f.hround = function(val) {
	return Math.round(val * 100) / 100
}

f.pround = function(val, exp) {
	var precision = +exp || 2

	if(precision < 0) {
		var add = Math.pow(10, -precision)
		return Math.round(val / add) * add
	} else {
		var add = Math.pow(10,  precision)
		return Math.round(val * add) / add
	}
}

f.torad = function(val) {
	return val * Math.PI / 180
}

f.todeg = function(val) {
	return val / Math.PI * 180
}

f.prop = function(name) {
	return function(item) {
		return item[name]
	}
}

f.pset = function(name, value) {
	return function(item) {
		item[name] = value
	}
}

f.func = function(name) {
	var args = [].slice.call(arguments, 1)
	return function(item) {
		return item[name] && item[name].apply && item[name].apply(item, args)
	}
}

f.range = function(length) {
	length = +length || 0
	for(var r = [], i = 0; i < length; i++) r.push(i)
	return r
}

f.rangep = function(length, start, step) {
	length = isNaN(length) ? 0 : +length
	start  = isNaN(start ) ? 0 : +start
	step   = isNaN(step  ) ? 1 : +step
	for(var r = [], i = 0; i < length; i++) r.push(i * step + start)
	return r
}

f.follow = function(item, name) {
	for(var stack = []; item; item = item[name]) {
		stack.push(item)
	}
	return stack
}

f.copy = function(destination, source) {
	for(var name in source) {
		if(Object.prototype.hasOwnProperty.call(source, name)) {
			destination[name] = source[name]
		}
	}
	return destination
}

f.merge = function() {
	return [].slice.call(arguments).reduce(f.copy, {})
}

f.throttle = function(fn, delay) {
	var last = 0
	return function() {
		var now = new Date
		if(now - last > delay) {
			last = now
			return fn.apply(this, arguments)
		}
	}
}

f.postpone = function(fn, delay) {
	var timer
	return function() {
		clearTimeout(timer)
		timer = setTimeout(fn, delay)
	}
}

f.implode = function(string, data, skip) {
	return string.replace(/#\{(\w+)\}/g, function(match, name) {
		return name in data ? data[name] : skip ? match : ''
	})
}

f.nformat = function(num, size, zero) {
	var abs  = Math.abs(num)
	,   neg  = num < abs
	,   exp  = isNaN(num) ? 2 : f.exp(abs)
	,   fill = zero ? '0' : ' '
	,   diff = size - Math.max(0, exp) - neg - 1
	,   gap  = diff > 1 ? Array(diff).join(fill) : ''
	,   sign =  zero && neg ? '-' : fill
	,   val  = !zero && neg ? num : abs
	return sign + gap + val
}

f.dformat = function(date, format) {
	var map = {
		'Y': 'getFullYear',
		'M': 'getMonth',
		'D': 'getDate',
		'h': 'getHours',
		'i': 'getMinutes',
		's': 'getSeconds'
	}
	var add = {
		'M': 1
	}
	return format.replace(/([YMDhis])(\1+)?/g, function(all, one) {
		return f.nformat(date[map[one]]() + (add[one] || 0), all.length)
	})
}

f.color = function(r, g, b, a) {
	return 'rgba('+ [r, g, b, isNaN(a) ? 1 : +a] +')'
}

f.rcolor = function(alpha) {
	return 'rgba('+ [255,255,255].map(f.rand).concat(+alpha || 1) +')'
}

f.mitm = function(object, method, watcher, modify) {
	var original = object[method]
	object[method] = function() {
		var result = watcher.call(this, method, arguments, original)
		return modify ? result : original.apply(this, arguments)
	}
}

f.callown = function(name, scope) {
	return function(item) {
		if(item
		&& Object.prototype.hasOwnProperty.call(item, name)
		&& typeof item[name] === 'function')
			return item[name].call(scope || item)
	}
}

f.unit = function(parent, proto) {
	if(arguments.length <2) {
		proto  = parent
		parent = null
	}
	function Unit() {
		this.init && this.init.apply(this, arguments)
	}
	Unit.New = function() {
		var unit = Object.create(Unit.prototype)
		Unit.apply(unit, arguments)
		return unit
	}
	proto = Unit.prototype = parent ? f.copy(Object.create(parent.prototype), proto) : proto
	proto.protochain = proto.protochain ? proto.protochain.concat(proto) : [proto]
	proto.constructor = Unit
	return Unit
}
