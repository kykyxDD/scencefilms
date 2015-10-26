function Anim_menu (cont) {

	var self = this;
    this.cont = cont
    
	this.header_menu = this.cont.querySelector('.header_cont');
    this.header_label = this.cont.querySelector('.haeder_label')
    this.header_cont = this.cont.querySelector('.header_cont')
    this.lines = cont.querySelectorAll('.line')
    
    this.menu_cont = this.cont.querySelector('.menu_cont')
	this.close_btn = this.cont.querySelector('.close_btn')
    
    ScreenObject.decorate_element.apply(this.menu_cont)
    ScreenObject.decorate_element.apply(this.close_btn)
    ScreenObject.decorate_element.apply(this.header_label)
    ScreenObject.decorate_element.apply(this.header_cont)
    
    for (var i=0; i<this.lines.length; i++) {
        ScreenObject.decorate_element.apply(this.lines[i])
    }
    
    this.items = [];
   
}
Anim_menu.prototype = {

    init: function(pages, index, mobile) {

        var divs = this.cont.querySelectorAll(".cont_list_menu")
    
        for (var i=0; i<pages.length; i++) {

            var page = pages[i];
            var itm = divs[i]
            itm.line = itm.querySelector('.line');
            itm.label = itm.querySelector('.label');
            ScreenObject.decorate_element.apply(itm);
            ScreenObject.decorate_element.apply(itm.line);
            itm.line.x = -250; 
            itm.line.w = 150; 

			itm.line.scaleX = 0;

            this.create_event(itm, page);
           
            this.menu_cont.appendChild(itm)
            this.items.push(itm)
        }

        this.reset(mobile)
    },

    create_event: function(elem, page){

		var self = this;
		elem.label.addEventListener('mouseover', function(e){
			self.onOver(elem)
		})
		elem.label.addEventListener('mouseout', function(e){
			self.onOut(elem)
		})

		elem.addEventListener('click', function(e){
			self.onClick && self.onClick(page)
		})
	},
	onOver:function(elem){

		var line = elem.line;
		line.x = -150; 
		line.scaleX = 0;
		TweenLite.to(line, 0.2, {x:0, scaleX:1})
	},

	onOut:function(elem){

		var line = elem.line;
		line.x = 0;
		line.scaleX = 1;
		TweenLite.to(line, 0.4, {x:line.w, scaleX:0});
	},

    reset: function() {

        for (var i=0; i<this.lines.length; i++) {
            var line = this.lines[i]
            line.x = -30
            line.visible = false
        }

        for (var i=0; i<this.items.length; i++) {
            var itm = this.items[i]
            itm.visible = false
            itm.x = -250
        }

        this.close_btn.y = -90
        this.close_btn.x = 0
        this.header_label.y = -66
        this.header_label.x = 0
        this.header_cont.x = 0
        this.header_cont.y = -6
        this.header_cont.alpha = 1
    },

    align_header: function(){

    	this.header_label.y = -66;
        this.header_label.x = 0;

        for (var i=0; i<this.lines.length; i++) {
            var line = this.lines[i];
            line.x = -30;
            line.visible = false;
        }

        this.header_cont.x = 0;
        this.header_cont.y = -6;
        this.header_cont.alpha = 1;
    },
    
    show_header: function(show_delay) {

        this.align_header();

        var show_delay = show_delay || 0;

        TweenLite.to(this.header_label, 0.42, {y: 0, delay: show_delay})

        var delay = show_delay + 0.0;
        var l = this.lines.length;
        this.header_cont.visible = true;
        for (var i=0; i<l; i++) {
            var line = this.lines[i]
            TweenLite.to(line, 0.17, {x: 0, delay: delay, ease: Power0.easeIn, onStart: function() {this.visible = true}, onStartScope: line})
            delay += 0.1*(l-(i+1))
        }

        TweenLite.to(this.header_cont, 0.3, {y: 0, delay: show_delay+0.42})
    },

    hide_header: function(mobile) {
        var win_width = window.innerWidth;
        if(!mobile){
            TweenLite.to(this.header_cont, 0.5, {x: 150, alpha: 0})
        } else {
            TweenLite.to(this.header_cont, 0.5, {x: win_width, alpha: 0})
        }
        this.header_cont.visible = false;
    },

    collapse: function(mobile, header) {
        var delay = 0;
        var self = this;
        if(this.anim_header){
            clearTimeout(this.anim_header)
        }
        if(header == 'hide'){
            this.hide_header()
        }

        for (var i=0, l=this.items.length; i<l; i++) {
            var itm = this.items[i];
            itm.alpha = 1;
            delay = (l-i-1)*0.1;
            TweenLite.to(itm, 0.3, {x: -250, alpha: 0, delay: delay, ease: Power0.easeOut});
            itm.anim = setTimeout(function(itm){
                itm.visible = false;
            }, 300*(l-i), itm)
        }
        TweenLite.killTweensOf(this.close_btn);
        TweenLite.to(this.close_btn, 0.2, {y: -90, delay: 0})

        this.menu_cont.visible = false;

        if(header == 'show'){
            this.anim_header = setTimeout(function(){
                self.show_header()
            }, 500)
        }

    },
    
    expand: function(expand_delay) {

        var expand_delay = expand_delay || 0
        var delay = 0;
        this.menu_cont.visible = true;

        for (var i=0; i<this.items.length; i++) {
            var itm = this.items[i];
            if(itm.anim){
                clearTimeout(itm.anim)
            }
            itm.visible = true
            itm.alpha = 0

            delay = expand_delay + i*0.1
            TweenLite.to(itm, 0.3, {x: 0, alpha: 1, delay: delay, ease: Power0.easeOut})
        }
        TweenLite.killTweensOf(this.close_btn);
        TweenLite.to(this.close_btn, 0.2, {y: 0, delay: expand_delay + 0.3})
        TweenLite.to(this.close_btn, 0.9, {y: 7, delay: expand_delay + 0.3 + 0.2})
    },
    resize: function(mobile){
        var win_width = document.documentElement.clientWidth;
        var win_height = document.documentElement.clientHeight;
        ScreenObject.decorate_element.apply(this.menu_cont);

        if(mobile){
            var h = this.menu_cont.h ? this.menu_cont.h : 188;
            var top = (win_height - h)/2;
            var left = (win_width - 150)/2;
            this.menu_cont.style.left = left + 'px';
            this.menu_cont.style.top = top + 'px';
        } else {
            this.menu_cont.style.left = '27px' 
            this.menu_cont.style.top = '65px'
        }
    },
    stopAll: function(){
        TweenLite.killTweensOf(this.close_btn);
        TweenLite.killTweensOf(this.header_cont)
        TweenLite.killTweensOf(this.header_label)
        this.menu_cont.visible = false;
        this.header_cont.visible = false;
        this.header_label.visible = false;
        if(this.anim_header){
            clearTimeout(this.anim_header)
        }

        for (var i=0; i<this.lines.length; i++) {
            var line = this.lines[i]
            line.x = -30
            line.visible = false
            TweenLite.killTweensOf(line);
        }

        for (var i=0; i<this.items.length; i++) {
            var itm = this.items[i];
            TweenLite.killTweensOf(itm)
            if(itm.anim){
                clearTimeout(itm.anim)
            }
            itm.visible = false
            itm.x = -250;
        }

        this.close_btn.y = -90
        this.close_btn.x = 0
        this.header_label.y = -66
        this.header_label.x = 0
        this.header_cont.x = 0
        this.header_cont.y = -6
        this.header_cont.alpha = 1
    }
}