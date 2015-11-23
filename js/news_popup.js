function NewsPopup(cont) {
    
    this.cont = cont
    this.init()
    
    this.bg = this.cont.querySelector(".popup_bg")
    this.content = this.cont.querySelector(".popup_content")
    this.scroll_cont = this.content.querySelector(".scroll_cont")
    this.text_cont = this.content.querySelector(".text_cont")
    this.title = this.content.querySelector(".title")
    this.date = this.content.querySelector(".date")
    this.btn = this.cont.querySelector(".close_btn")
    this.img_cont = this.cont.querySelector(".popup_img_cont")
    this.preloader = this.cont.querySelector(".popup_preloader")
    this.img = this.cont.querySelector(".popup_img")
    this.icons = this.cont.querySelectorAll(".ico")
    this.icons = Array.prototype.slice.call(this.icons)

    ScreenObject.decorate_element.apply(this.bg)
    ScreenObject.decorate_element.apply(this.content)
    ScreenObject.decorate_element.apply(this.btn)
    ScreenObject.decorate_element.apply(this.scroll_cont)
    ScreenObject.decorate_element.apply(this.img_cont)
    ScreenObject.decorate_element.apply(this.preloader)
    ScreenObject.decorate_element.apply(this.img)
    
    this.btn.top = this.btn.left = 0
    
    this.w = 1200
    this.h = 600
    
    this.scroll = new IScroll(this.scroll_cont, {useTransition: false, scrollbars: true, mouseWheel: true})
    
    this.title_anim = new TextAnimator(this.title, 1, 0)
    this.date_anim = new TextAnimator(this.date, 1, 0)
    this.text_anim = new TextAnimator(this.text_cont, 2, 0)
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

        this.img_cont.alpha = 1
        TweenLite.from(this.img_cont, 0.5, {alpha: 0, x: this.img_cont.sx-10, delay: 0.8})

        this.text_cont.innerHTML = data.full_desc
        this.title.textContent = data.short_desc
        this.date.textContent = data.date

        this.img.src = data.img
        this.img.style.width = '100%';
        this.img.alpha = 0
        this.img.onload = angular.bind(this, this.on_image_load)

        this.title_anim.text = data.short_desc
        this.date_anim.text = data.date
        this.text_anim.text = data.full_desc
        this.update_inner_size()
        this.scroll.refresh()

        this.title_anim.run(0.6)
        this.date_anim.run(0.6)
        this.text_anim.run(0.6)

        for (var i=0; i<this.icons.length; i++) {
            var ico = this.icons[i]
            ScreenObject.decorate_element.apply(ico)
            TweenLite.from(ico, 1, {x: "-=10", alpha: 0, delay: 0.6+0.2*i})
        }
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

        this.img.alpha = 1
        TweenLite.from(this.img, 1, {alpha: 0, scaleX: k*oversize, scaleY: k*oversize})
    },

    resize: function(w, h) {

        this.w = Math.min(w*0.95, 1200)
        this.h = Math.min(h*0.95, 600)
        
        this.btn.sx = this.btn.x = (w + this.w)/2 - 25
        this.btn.sy = this.btn.y = (h - this.h)/2
        
        this.img_cont.sx = this.img_cont.x = (w - this.w)/2
        this.img_cont.sy = this.img_cont.y = (h - this.h)/2
        this.img_cont.w = this.w*0.42
        this.img_cont.h = this.h
        
        var content_margin_top = 25
        
        this.content.sx = this.content.x = Math.round((w - this.w)/2 + this.w*0.45)
        this.content.sy = this.content.y = Math.round((h - this.h)/2 + content_margin_top)
        this.content.w = Math.round(this.w*0.53)
        this.content.h = Math.round(this.h - content_margin_top)
        
        this.bg.sx = this.bg.x = (w - this.w)/2
        this.bg.sy = this.bg.y = (h - this.h)/2
        this.bg.w = this.w
        this.bg.h = this.h
        
        this.update_inner_size()
        this.scroll.refresh()
    },
    
    update_inner_size: function() {

        var title_h = this.title.clientHeight
        var date_h = this.date.clientHeight

        this.scroll_cont.w = this.content.w
        this.scroll_cont.h = this.content.h - title_h - date_h - 120
    },
    
    destroy: function() {
        TweenLite.killTweensOf(bg)
        TweenLite.killTweensOf(this.btn)
        TweenLite.killTweensOf(this.cont)
        TweenLite.killTweensOf(this.img_cont)

        this.icons.forEach(TweenLite.killTweensOf)
        this.title_anim.stop()
        this.date_anim.stop()
        this.text_anim.stop()
        this.scroll.destroy();
        delete this.img.onload
        this.img.src = ""
   }
}