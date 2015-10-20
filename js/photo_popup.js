function PhotoPopup(cont) {
    
    this.cont = cont
    this.init()
    
    this.bg = this.cont.querySelector(".popup_bg")
    this.btn = this.cont.querySelector(".close_btn")
    this.img_cont = this.cont.querySelector(".popup_img_cont")
    this.preloader = this.cont.querySelector(".popup_preloader")
    this.img = this.cont.querySelector(".popup_img")
    
    ScreenObject.decorate_element.apply(this.bg)
    ScreenObject.decorate_element.apply(this.btn)
    ScreenObject.decorate_element.apply(this.img_cont)
    ScreenObject.decorate_element.apply(this.preloader)
    ScreenObject.decorate_element.apply(this.img)
    
    this.btn.top = this.btn.left = 0
    
    this.w = 1200
    this.h = 600
}

PhotoPopup.prototype = {

    init: function() {
        this.hide()
    },

    show: function(target, data) {
        
        dom.display(this.cont, true)
        var r = target.getBoundingClientRect()

        this.bg.x = r.left
        this.bg.y = r.top
        this.bg.w = r.width
        this.bg.h = r.height
        this.bg.alpha = 0
        
        TweenLite.to(this.bg, 0.3, {alpha: 1})
        TweenLite.to(this.bg, 0.3, {h: this.h, y: this.bg.sy, delay: 0.3})
        TweenLite.to(this.bg, 0.3, {w: this.w, x: this.bg.sx, delay: 0.6})
        
        this.btn.alpha = 1
        TweenLite.from(this.btn, 0.5, {alpha: 0, x: this.btn.sx-10, delay: 0.8})
        
        this.img_cont.alpha = 1
        TweenLite.from(this.img_cont, 0.5, {alpha: 0, x: this.img_cont.sx-10, delay: 0.8})
        
        console.log("show photo popup", data.src_big)
        
        this.img.alpha = 0
        this.img.src = data.src_big
        this.img.onload = angular.bind(this, this.on_image_load)
    },

    hide: function() {
        dom.display(this.cont, false)
    },
    
    on_image_load: function() {
        var k = Math.max(this.img_cont.w/this.img.width, this.img_cont.h/this.img.height)
        
        this.img.scaleX = this.img.scaleY = k
        this.img.x = (this.img_cont.w - this.img.width*k)/2 - this.img.width*(1-k)/2
        this.img.y = (this.img_cont.h - this.img.height*k)/2 - this.img.height*(1-k)/2
        
        var oversize = 1.25
        //var dx = ((this.img_cont.w - this.img.width*k*oversize)/2 - this.img.x)/2
        //var dy = ((this.img_cont.h - this.img.height*k*oversize)/2 - this.img.y)/2
        
        this.img.alpha = 1
        TweenLite.from(this.img, 1, {alpha: 0, scaleX: k*oversize, scaleY: k*oversize})
    },

    resize: function(w, h) {

        this.w = Math.min(w*0.95, 1200)
        this.h = Math.min(h*0.95, 600)
    
        this.btn.sx = this.btn.x = (w + this.w)/2 - 33
        this.btn.sy = this.btn.y = (h - this.h)/2
        
        this.img_cont.sx = this.img_cont.x = (w - this.w)/2
        this.img_cont.sy = this.img_cont.y = (h - this.h)/2
        this.img_cont.w = this.w
        this.img_cont.h = this.h
        
        this.bg.sx = this.bg.x = (w - this.w)/2
        this.bg.sy = this.bg.y = (h - this.h)/2
        this.bg.w = this.w
        this.bg.h = this.h
    },
    
    destroy: function() {
        
        this.img.src = ""
        
        TweenLite.killTweensOf(bg)
        TweenLite.killTweensOf(this.btn)
        TweenLite.killTweensOf(this.img_cont)
        
        delete this.img.onload
    }
}