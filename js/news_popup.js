function NewsPopup(cont) {
    
    this.cont = cont
    this.init()
    
    this.bg = this.cont.querySelector(".popup_bg")
    this.img = this.cont.querySelector(".popup_img")
    this.content = this.cont.querySelector(".popup_content")
    this.btn = this.cont.querySelector(".close_btn")
    
    ScreenObject.decorate_element.apply(this.bg)
    ScreenObject.decorate_element.apply(this.img)
    ScreenObject.decorate_element.apply(this.content)
    ScreenObject.decorate_element.apply(this.btn)
    
    this.btn.top = this.btn.left = 0
    
    this.w = 1200
    this.h = 600
}

NewsPopup.prototype = {

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
        
        this.content.alpha = 1
        TweenLite.from(this.content, 0.5, {alpha: 0, x: this.content.sx-10, delay: 0.8})
        
        this.img.alpha = 1
        TweenLite.from(this.img, 0.5, {alpha: 0, x: this.img.sx-10, delay: 0.8})
        
        console.log("show", r)
    },

    hide: function() {
        dom.display(this.cont, false)
    },

    resize: function(w, h) {
        
        this.btn.sx = this.btn.x = (w + this.w)/2 - 25
        this.btn.sy = this.btn.y = (h - this.h)/2
        
        this.img.sx = this.img.x = (w - this.w)/2
        this.img.sy = this.img.y = (h - this.h)/2
        
        this.content.sx = this.content.x = (w - this.w)/2 - Math.round(w*0.7)
        this.content.sy = this.content.y = (h - this.h)/2
        
        this.bg.sx = this.bg.x = (w - this.w)/2
        this.bg.sy = this.bg.y = (h - this.h)/2
        this.bg.w = this.w
        this.bg.h = this.h
    }

}