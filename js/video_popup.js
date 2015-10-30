function VideoPopup(cont) {
    
    this.cont = cont
    this.init()
    
    this.bg = this.cont.querySelector(".popup_bg")
    this.btn = this.cont.querySelector(".close_btn")
    this.video_cont = this.cont.querySelector(".video_cont")
    this.video_desc = this.cont.querySelector(".video_desc")
    this.video_list = this.cont.querySelector(".video_list")
    this.preloader = this.cont.querySelector(".popup_preloader")
    this.title = this.cont.querySelector(".title")
    this.list_cont = this.cont.querySelector(".video_list_scroll")
    this.list = this.cont.querySelector(".video_list_cont")
    
    ScreenObject.decorate_element.apply(this.bg)
    ScreenObject.decorate_element.apply(this.btn)
    ScreenObject.decorate_element.apply(this.video_cont)
    ScreenObject.decorate_element.apply(this.video_desc)
    ScreenObject.decorate_element.apply(this.video_list)
    ScreenObject.decorate_element.apply(this.preloader)
    ScreenObject.decorate_element.apply(this.list_cont)
    
    this.btn.top = this.btn.left = 0
    
    this.scroll = new IScroll(this.list_cont, {useTransition: false, scrollbars: true, mouseWheel: true})
    
    this.w = 1200
    this.h = 600
}

VideoPopup.prototype = {

    init: function() {
        this.hide()
    },

    show: function(target, data) {
        
        this.data = data
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
        TweenLite.from(this.btn, 0.5, {alpha: 0, x: this.btn.sx-10, delay: 1})

        this.video_cont.alpha = 1
        TweenLite.from(this.video_cont, 0.5, {alpha: 0, x: this.video_cont.sx-10, delay: 0.6, onComplete: angular.bind(this, this.on_open)})
        
        this.video_desc.alpha = 1
        TweenLite.from(this.video_desc, 0.5, {alpha: 0, x: this.video_desc.sx-10, delay: 0.6})

        this.video_list.alpha = 1
        TweenLite.from(this.video_list, 0.5, {alpha: 0, x: this.video_list.sx-10, delay: 0.8})

        this.title.textContent = data.desc
        
        this.scroll.refresh()
    },
    
    reload: function(data) {
        
        this.data = data
        
        this.title.textContent = data.desc
        
        this.player && this.player.destroy()
        this.on_open()
    },

    hide: function() {
        dom.display(this.cont, false)
    },
    
    on_open: function() {
        var data = this.data
        var preloader = this.preloader
        this.preloader.alpha = 1

        var div = this.cont.querySelector('.player')
        var player = this.player = new YT.Player(div, {
            width: this.video_cont.w,
            height: this.video_cont.h,
            //videoId: '4wUlQDFY2aQ',
            playerVars: {controls: 0},
            events: {
                onReady: function(e) {
                    TweenLite.to(preloader, 0.5, {alpha: 0})
                    player.loadVideoByUrl(data.youtube)
                }
            }})
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
        
        this.w = Math.min(w*0.95, 1200)
        this.h = Math.min(h*0.95, 600)
        
        var left = Math.round((w - this.w)/2)
        var top = Math.round((h - this.h)/2)
        
        this.btn.sx = Math.round(this.btn.x = (w + this.w)/2 - 25)
        this.btn.sy = this.btn.y = top
        
        this.bg.sx = this.bg.x = left
        this.bg.sy = this.bg.y = top
        this.bg.w = this.w
        this.bg.h = this.h
        
        this.video_cont.sx = this.video_cont.x = Math.round(left + 15)
        this.video_cont.sy = this.video_cont.y = Math.round(top + 20)
        this.video_cont.w = this.w - 500
        this.video_cont.h = this.h - 155
        
        this.video_desc.sx = this.video_desc.x = Math.round(this.video_cont.x)
        this.video_desc.sy = this.video_desc.y = Math.round(this.video_cont.y + this.video_cont.h)
        this.video_desc.w = this.video_cont.w
        this.video_desc.h = 130

        this.video_list.sx = this.video_list.x = Math.round(this.video_cont.x + this.video_cont.w + 35)
        this.video_list.sy = this.video_list.y = this.video_cont.y
        this.video_list.w = this.w - this.video_cont.w - 35
        this.video_list.h = this.h - 10
        
        this.list_cont.h = this.video_list.h - 115
        this.scroll.refresh()
    },
    
    destroy: function() {
        
        this.player.destroy()
        
        TweenLite.killTweensOf(bg)
        TweenLite.killTweensOf(this.btn)
    }
}