function Background(cont, skip_event_frames) {
    
    this.cont = cont
    ScreenObject.decorate_element.apply(this.cont)
    
    this.anim = new AnimatedBackground(cont, skip_event_frames)
    this.init()
    
    this.images = []
}

Background.prototype = {

    init: function(data) {
        this.data = data
        this.hide()
        this.anim.hide()
    },
    
    prepare: function(ref, clear_bg_image) {
        this.bg_data = this.data.backgrounds[ref]
        if (this.bg_data.lines) {
            this.anim.prepare(this.bg_data.lines)
        }
        
        if (clear_bg_image) {
            this.remove_all_images()
        }
        
        this.load_image(this.bg_data.img)
        this.anim.clearCanvas()
        this.killTweens()
    },
    
    resize: function(w, h){
        
        var base_w = 1920
        var base_h = 1080
        this.WIDTH = w
        this.HEIGHT = h
        
        this.anim.set_size(base_w, base_h)

        //this.cont.style.width = w + "px"
        //this.cont.style.height = h + "px"
        
        var k = Math.max(w/base_w, h/base_h)

        var dx = base_w - w*k
        var dy = base_h - h*k
        
        function set_scale(mc) {
            mc.scaleX = mc.scaleY = k
        }
        
        set_scale(this.cont)
        //set_scale(this.anim.canvas)
        //this.images.forEach(set_scale)
    },

    show: function() {
        dom.display(this.cont, true)
    },
    
    hide: function() {
        dom.display(this.cont, false)
    },
    
    killTweens: function() {
        
        TweenLite.killTweensOf(this.anim)
        TweenLite.killTweensOf(this.anim.canvas)
        
        this.images.forEach(function(img){TweenLite.killTweensOf(img)})
    },
    
    stop: function() {
        
        this.images.forEach(function(img){ delete img.onload })
        this.killTweens()
    },
    
    play: function() {
        if (this.loading) {
            this.delayedPlay = angular.bind(this, this.play)
            return
        }
        
        delete this.delayedPlay  
        
        this.show()
        this.anim.show()
        this.anim.percent = 0
        
        var duration = 2
        
        this.anim.canvas.alpha = 1
        TweenLite.to(this.anim, duration, {percent: 100, onUpdate: angular.bind(this.anim, this.anim.repaintCanvas)})
        TweenLite.to(this.anim.canvas, 1, {alpha: 0, delay: duration})
        
        var last_img = this.images[this.images.length-1]
        last_img.visible = true
        last_img.alpha = 0
        TweenLite.to(last_img, duration, {alpha: 1, delay: 1})
    },
    
    play2: function() {

        while (this.images.length > 2) {
            this.remove_image(this.images.shift())
        }
        
        if (this.images.length == 2) {
            var old_img = this.images[0]
            
            old_img.visible = true
            TweenLite.to(old_img, 0.5, {alpha: 0})
        }
        
        var new_img = this.images[this.images.length-1]
        
        if (this.loading) {
            this.delayedPlay = angular.bind(this, this.play2)
            
            if (this.bg_data.lines) {
                this.anim.show()
                this.anim.percent = 0
                this.anim.canvas.alpha = 1
                TweenLite.to(this.anim, 10, {percent: 75, onUpdate: angular.bind(this.anim, this.anim.repaintCanvas), ease: Power3.easeOut, delay: 0.5})
            }
        }
        else {
            if (this.bg_data.lines) {
                TweenLite.to(this.anim, 2, {percent: 100, onUpdate: angular.bind(this.anim, this.anim.repaintCanvas)})
                TweenLite.to(this.anim.canvas, 1, {alpha: 0, delay: 2.5})
                var delay = 1
            }
            else {
                var delay = 0
            }

            var duration = 1.5
            
            delete this.delayedPlay        
            
            this.show()
            
            new_img.visible = true
            new_img.alpha = 0
            TweenLite.killTweensOf(new_img)
            TweenLite.to(new_img, duration, {alpha: 1, delay: delay})

        }
    },
    
    load_image: function(src) {
        
        this.loading = true
        
        var img = document.createElement("img")
        ScreenObject.decorate_element.apply(img)
        img.src = src
        img.onload = angular.bind(this, this.on_image_loaded, img)
        img.visible = false
        
        if (this.cont.children.length > 1) {
            this.cont.insertBefore(img, this.anim.canvas)
        }
        else {
            this.cont.insertBefore(img, this.cont.firstChild)
        }
        
        this.images.push(img)
    },
    
    on_image_loaded: function(img) {
        
        this.resize(this.WIDTH, this.HEIGHT)
        
        this.loading = false
        this.delayedPlay && this.delayedPlay()
        this.onLoad && this.onLoad()
        this.onLoad = null
    },
    
    remove_image: function(img) {
        this.cont.removeChild(img)
        delete img.onload
    },
    
    remove_all_images: function() {
        while (this.images.length) {
            this.remove_image(this.images.pop())
        }
    },
    
    clear: function() {
        this.anim.clearCanvas()
        this.stop()
        this.remove_all_images()
    }

}
