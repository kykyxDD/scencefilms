angular.module('directives', [])
.directive('onComplete', function(){
    return {
        link: function($s, el, attr) {
            
            if ($s.$last) {
                $s.$evalAsync(attr.onCompleteCallback);
            }
        }
        
    }
})
.directive('animateText', function(){
    
	function convert_str(str) {
		var column = 0
		
		var text = str.replace(/[\w\W]/g, function(symbol) {
			if(++column > 80 && symbol === ' ') symbol = '\n';
			if(symbol === '\n') column = 0
			return symbol
		});
        
		return text
	}
    
    return {
        scope: {
            text: "=",
            duration: "=",
            delay: "=",
            callback: "&textAnimationFinished",
            callback2: "&textAnimationBegin"
        },

        link: function($s, el, attr) {

            var delay = $s.delay || 0
            var duration = $s.duration || 1
            var text = convert_str($s.text)
            var element = el[0]
            
            var obj = new TextAnimator(element, duration, delay)
            obj.text = text
            ScreenObject.decorate_element.apply(element)

            $s.$watch('text', function(new_text, old_text) {
                
                var oh = element.h
                element.style.height = ""
                element.innerHTML = new_text
                var nh = element.clientHeight
                $s.callback2()
                element.innerHTML = ""
                TweenLite.killTweensOf(element)
                element.h = oh
                TweenLite.to(element, 1, {h: nh, onComplete: $s.callback})

                //obj.delay = 0
                obj.text = new_text
                obj.index = 0
                obj.run()
                
            })

            $s.$on('$destroy', clean_up)

            function clean_up() {
                obj.stop()
            }
        }
    }
})
.directive('animateAlphaShiftX', function() {
  
    return {
        scope: {
            delay: '=',
            shift: '=',
            duration: '='
        },
        link: function($s, el, attr) {
            
            var div = el[0]
            var delay = $s.delay || 0
            var shift = $s.shift || 10
            var duration = $s.duration || 0.3
            
            ScreenObject.decorate_element.apply(div)
            TweenLite.from(div, duration, {alpha: 0, x: "-="+shift, delay: delay})

            $s.$on('$destroy', function() {
                TweenLite.killTweensOf(div)
            })
            
        }
    }
  
})
.directive('animateImageLoad', ['$document', function($doc) {
  
    return {
        scope: {
            w: '=imgW',
            h: '=imgH',
            duration: '=',
            url: '=imgUrl'
        },
        link: function($s, el, attr) {

            var div = el[0]
            var img = div.querySelector("img")
            var duration = $s.duration || 1
            var url = $s.url
            
            if (!img) {
                $doc[0].createElement("img")
                div.appendChild(img)
            }

            ScreenObject.decorate_element.apply(img)
            img.src = url
            img.alpha = 0
            img.onload = function() {

                var w = $s.w || div.clientWidth
                var h = $s.h || div.clientHeight
                
                div.style.width = w + "px"
                div.style.height = h + "px"
            
                var k = Math.max(w/img.width, h/img.height)
                img.scaleX = img.scaleY = k
                img.x = (w - img.width*k)/2 - img.width*(1-k)/2
                img.y = (h - img.height*k)/2 - img.height*(1-k)/2
                
                var oversize = 1.1
                var dx = ((w - img.width*k*oversize)/2 - img.x)/2
                var dy = ((h - img.height*k*oversize)/2 - img.y)/2
                
                img.alpha = 1
                TweenLite.from(img, duration, {alpha: 0, ease: Linear.easeNone})
                TweenLite.from(img, duration/2, {x: -dx, y: -dy, scaleX: oversize, scaleY: oversize, ease: Cubic.easeOut})
            }
            
            $s.$on('$destroy', function() {
                delete img.onload
                TweenLite.killTweensOf(img)
            })

        }
    }
  
}])
.directive('tap', ['$document', function($doc) {
    
    var doc = $doc[0]
    
    var x, y
    
    function on(e) {
        e = e.touches ? e.touches[0] : e
        x = e.pageX
        y = e.pageY
    }
    function off(e) {
        e = e.changedTouches ? e.changedTouches[0] : e
        x = Math.abs(e.pageX - x)
        y = Math.abs(e.pageY - y)
        if(x <3 && y <3) {
            var tap = document.createEvent('CustomEvent')
            tap.initCustomEvent('tap', true, true, e)
            e.target.dispatchEvent(tap)
        }
    }
    doc.addEventListener('mousedown',  on, true)
    doc.addEventListener('mouseup',   off, true)
    doc.addEventListener('touchstart', on, true)
    doc.addEventListener('touchend',  off, true)

    return {
        
        scope: {
            tap: "&tap"            
        },
        
        link: function($s, elem, attr) {
            
            elem.on('tap', on_tap)
            $s.$on("$destroy", clean_up)
            
            function on_tap(e) {
                $s.tap()
            }
            
            function clean_up() {
                elem.off('tap', on_tap)
            }
            
        }
        
    }
    
}])