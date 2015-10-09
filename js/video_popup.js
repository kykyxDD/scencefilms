function VideoPopup(cont) {
    
    this.cont = cont
    this.init()
    
    this.bg = this.cont.querySelector(".popup_bg")
    this.btn = this.cont.querySelector(".close_btn")
    
    ScreenObject.decorate_element.apply(this.bg)
    ScreenObject.decorate_element.apply(this.btn)
    
    this.btn.top = this.btn.left = 0
    
    this.w = 1200
    this.h = 600
}

VideoPopup.prototype = {

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
    },

    hide: function() {
        dom.display(this.cont, false)
    },
    
    on_image_load: function() {
        var k = Math.max(this.img_cont.w/this.img.width, this.img_cont.h/this.img.height)
        this.img.scaleX = this.img.scaleY = k
        this.img.x = (this.img_cont.w - this.img.width)/2
        this.img.y = (this.img_cont.h - this.img.height)/2
        
        this.img.alpha = 1
        TweenLite.from(this.img, 1, {alpha: 0, scaleX: k*1.1, scaleY: k*1.1})
    },

    resize: function(w, h) {
        
        this.btn.sx = this.btn.x = (w + this.w)/2 - 25
        this.btn.sy = this.btn.y = (h - this.h)/2
        
        this.bg.sx = this.bg.x = (w - this.w)/2
        this.bg.sy = this.bg.y = (h - this.h)/2
        this.bg.w = this.w
        this.bg.h = this.h
    },
    
    destroy: function() {
        TweenLite.killTweensOf(bg)
        TweenLite.killTweensOf(this.btn)
    }
}