function Anim_menu (cont) {

	var self = this;
    this.cont = cont
    
	this.header_menu = this.cont.querySelector('.header_cont');
    this.header_label = this.cont.querySelector('.haeder_label')
    this.header_cont = this.cont.querySelector('.header_cont')
    this.lines = cont.querySelectorAll('.line')
    
    this.menu_cont = this.cont.querySelector('.menu_cont')
	this.close_btn = this.cont.querySelector('.close_btn')
   
    ScreenObject.decorate_element.apply(this.close_btn)
    ScreenObject.decorate_element.apply(this.header_label)
    ScreenObject.decorate_element.apply(this.header_cont)
    
    for (var i=0; i<this.lines.length; i++) {
        ScreenObject.decorate_element.apply(this.lines[i])
    }
    
    this.items = [];
   
}
Anim_menu.prototype = {
    
    init: function(pages, index) {
        
        for (var i = index; i < pages.length; i++) {
            var page = pages[i]
            var itm = document.createElement("div")
            itm.className = "cont_list_menu"
            itm.innerHTML = "<div class='label'>" + page.name + "</div><div class='line'></div>"
            itm.line = itm.querySelector('.line')
            ScreenObject.decorate_element.apply(itm)
            ScreenObject.decorate_element.apply(itm.line)
            itm.line.x = -250; 
            itm.line.w = 150; 

			itm.line.scaleX = 0;
            
            itm.y = 12 * (i-index);

            this.create_event(itm, i-index, page);
           
            this.menu_cont.appendChild(itm)
            this.items.push(itm)
        }

        this.reset()
    },

    create_event: function(elem, index, page){
    	
		var self = this;
		elem.addEventListener('mouseover', function(e){
			self.onOver(elem, index,page)
		})
		elem.addEventListener('mouseout', function(e){
			self.onOut(elem, index,page)
		})


		elem.addEventListener('click', function(e){
			self.onClick(page)
		})
	},
	onOver:function(elem, index, page){

		
		var line = elem.line;
		line.x = -150; 
		line.scaleX = 0;
		TweenLite.to(line, 0.2, {x:0, scaleX:1})
	},

	onOut:function(elem, index, page){

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

        this.align_header()

        var show_delay = show_delay || 0

        TweenLite.to(this.header_label, 0.42, {y: 0, delay: show_delay})

        var delay = show_delay + 0.0
        var l = this.lines.length

        for (var i=0; i<l; i++) {
            var line = this.lines[i]
            TweenLite.to(line, 0.17, {x: 0, delay: delay, ease: Power0.easeIn, onStart: function() {this.visible = true}, onStartScope: line})
            delay += 0.1*(l-(i+1))
        }

        TweenLite.to(this.header_cont, 0.3, {y: 0, delay: show_delay+0.42})
    },

    hide_header: function() {
        TweenLite.to(this.header_cont, 0.5, {x: 150, alpha: 0})
    },

    collapse: function() {

        var expand_delay = expand_delay || 0
        var delay = 0;

        for (var i=0, l=this.items.length; i<l; i++) {
            var itm = this.items[i]
            itm.visible = true
            itm.alpha = 1
            delay = expand_delay + (l-i-1)*0.1
            TweenLite.to(itm, 0.3, {x: -250, alpha: 0, delay: delay, ease: Power0.easeOut})
        }

        TweenLite.to(this.close_btn, 0.2, {y: -90, delay: 0})
        // TweenLite.to(this.close_btn, 0.9, {y: 7, delay: expand_delay + 0.3 + 0.2})
    },
    
    expand: function(expand_delay) {

        var expand_delay = expand_delay || 0
        var delay = 0

        for (var i=0; i<this.items.length; i++) {
            var itm = this.items[i]
            itm.visible = true
            itm.alpha = 0
            delay = expand_delay + i*0.1
            TweenLite.to(itm, 0.3, {x: 0, alpha: 1, delay: delay, ease: Power0.easeOut})
        }

        TweenLite.to(this.close_btn, 0.2, {y: 0, delay: expand_delay + 0.3})
        TweenLite.to(this.close_btn, 0.9, {y: 7, delay: expand_delay + 0.3 + 0.2})
    }
}