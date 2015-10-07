function Transition(cont)
{
    var nope = function(){}

    this.cont = cont
    this.onShow = nope
    this.onCollapsed = nope
    this.onExpanded = nope
    this.onOpened = nope
    this.onClosed = nope
    this.init()
}

Transition.prototype = {

    init: function() {
        
        this.debug = false
        
        this.WIDTH = 1024
        this.HEIGHT = 800
        this.SQUARE_SIZE = 688
        this.yellow_exp_scale = 1
        this.black_exp_scale = 1
        this.time_scale = 1.25
        this.exp_rad = 2000
    
        this.yellow_part = this.cont.querySelector('#yellow_part')
        this.yellow_part.squary = this.cont.querySelector('.bg.yellow');
        this.black_part = this.cont.querySelector('#black_part')
        
        ScreenObject.decorate_element.apply(this.cont)
        ScreenObject.decorate_element.apply(this.yellow_part)
        ScreenObject.decorate_element.apply(this.black_part)
        ScreenObject.decorate_element.apply(this.yellow_part.squary)
        
        this.reset()
    },
    
    resize: function(w, h, mobile) {

        if (this.debug) console.log("resize", w, h)

        this.WIDTH = w
        this.HEIGHT = h

        if (this.current_state == 'opened') {
            this.calc_exp_scale()
            this.yellow_part.scaleX = this.yellow_part.scaleY = this.yellow_exp_scale
            this.black_part.scaleX = this.black_part.scaleY = this.black_exp_scale
        }

        if(mobile){

            var elem = this.yellow_part.squary
            var vis_w = elem.y + elem.w;

            var scale = window.innerWidth > window.innerHeight ? window.innerWidth/vis_w : window.innerHeight/vis_w; 
            if(this.current_state == 'expanded'){
                this.cont.y = 800;
                this.cont.rotation = 0;
                this.cont.scaleX =  scale;
                this.cont.scaleY =  scale;
            } else if (this.current_state == 'collapsed'){
                this.cont.y = 152;
                this.cont.rotation = 45;
                this.cont.scaleX = 1;
                this.cont.scaleY = 1;
            }
        } else {
            this.cont.scaleX = 1;
            this.cont.scaleY = 1;
            this.cont.rotation = 45;
            if(this.current_state == 'expanded'){
                this.cont.y = 380;
            } else if (this.current_state == 'collapsed'){
                this.cont.y = 152;
            }
        }
    },

    calc_exp_scale: function() {
        var tan_a = this.HEIGHT / this.WIDTH
        var projection_a = Math.cos(Math.atan(tan_a)) * this.WIDTH

        var tan_b = this.WIDTH / this.HEIGHT
        var projection_b = Math.cos(Math.atan(tan_b)) * this.HEIGHT
        
        this.exp_rad = Math.max(projection_a, projection_b)
        var half_size = this.SQUARE_SIZE/2
        this.yellow_exp_scale = this.exp_rad*2 / half_size
        this.black_exp_scale = (488+this.exp_rad) / half_size
    },
    
    reset: function() {
        
        if (this.debug) console.log("reset")
        
        this.current_state = 'closed'
    
        this.yellow_part.x = 0
        this.yellow_part.y = 0
        this.yellow_part.scaleX = this.yellow_part.scaleY = 1
        
        this.black_part.x = -488
        this.black_part.y = 0
        this.black_part.scaleX = this.black_part.scaleY = 1
        
        this.cont.rotation = 45
        this.cont.x = 0
        this.cont.y = 0
        
    },

    show: function(mobile) {
    
        if (this.debug) console.log("show")

    
        this.current_state = 'collapsed';
        this.cont.scaleX = 1;
        this.cont.scaleY = 1;
    
        this.cont.x = -469
        this.cont.y = 152;

        TweenLite.to(this.cont, 0.44*this.time_scale, {x: -15, ease: Power1.easeOut, onComplete: function(){if (this.debug) console.log("onShow"); this.onShow()}, onCompleteScope: this})
        TweenLite.to(this.cont, 0.5*this.time_scale, {x: 0, ease: Power1.easeOut, delay: 0.44*this.time_scale})
    },
    
    collapse: function(mobile) {

        if (this.debug) console.log("collapse")

        this.current_state = 'collapsed';
        this.cont.scaleX = 1;
        this.cont.scaleY = 1;

        if(!mobile){
            TweenLite.to(this.cont, 0.35*this.time_scale, {y: 167, ease: Power1.easeOut, onComplete: function(){ if (this.debug) console.log("onCollapsed"); this.onCollapsed()}, onCompleteScope: this})
            TweenLite.to(this.cont, 1*this.time_scale, {y: 152, ease: Power1.easeOut, delay: 0.35*this.time_scale})
        } else {
            TweenLite.to(this.cont, 0.35*this.time_scale, {y: 167, rotation: 45, ease: Power1.easeOut, onComplete: function(){ if (this.debug) console.log("onCollapsed"); this.onCollapsed()}, onCompleteScope: this})
            TweenLite.to(this.cont, 1*this.time_scale, {y: 152, ease: Power1.easeOut, delay: 0.35*this.time_scale})
        }
    },
    
    expand: function(mobile) {
        if (this.debug) console.log("expand")

        this.current_state = 'expanded';


        if(!mobile){
            TweenLite.to(this.cont, 0.35*this.time_scale, {y: 350, ease: Power1.easeOut, onComplete: function() {if (this.debug) console.log("onExpanded"); this.onExpanded()}, onCompleteScope: this})
            TweenLite.to(this.cont, 1*this.time_scale, {y: 380, ease: Power1.easeOut, delay: 0.35*this.time_scale})
        } else {
            var elem = this.yellow_part.squary
            var vis_w = elem.y + elem.w;

            var scale = window.innerWidth > window.innerHeight ? window.innerWidth/vis_w : window.innerHeight/vis_w; 

            this.cont.scaleX = scale;
            this.cont.scaleY = scale;
            TweenLite.to(this.cont, 0.8*this.time_scale, {y: 800, rotation: 0 , ease: Power1.easeOut, onComplete: function() {if (this.debug) console.log("onExpanded"); this.onExpanded()}, onCompleteScope: this})
            TweenLite.to(this.cont, 1*this.time_scale, {y: 800, ease: Power1.easeOut, delay: 0.8*this.time_scale})
        }

    },
    
    open: function() {
        
        if (this.debug) console.log("open")
        
        this.current_state = 'opened'
        this.calc_exp_scale()
        
        TweenLite.to(this.yellow_part, 0.5*this.time_scale, {scaleX: this.yellow_exp_scale, scaleY: this.yellow_exp_scale})
        TweenLite.to(this.black_part, 0.5*this.time_scale, {scaleX: this.black_exp_scale*0.9, scaleY: this.black_exp_scale*0.9, delay: 0.2*this.time_scale, onComplete: function(){ this.onOpened(); if (this.debug) console.log("onOpened");}, onCompleteScope: this})
        TweenLite.to(this.black_part, 2*this.time_scale, {scaleX: this.black_exp_scale, scaleY: this.black_exp_scale, delay: 0.7*this.time_scale})
    },
    
    close: function() {
    
        if (this.debug) console.log("close")
    
        this.current_state = 'closed'
        var yellow_tx = this.yellow_exp_scale * this.SQUARE_SIZE/2
        var black_tx = this.black_exp_scale * this.SQUARE_SIZE/2 + 488
    
        TweenLite.to(this.yellow_part, 0.5*this.time_scale, {scaleX: 0, scaleY: 4, x: yellow_tx})
        TweenLite.to(this.black_part, 0.5*this.time_scale, {scaleX: 0, scaleY: 4, x: black_tx, onComplete: function(){this.reset(); if (this.debug) console.log("onClose"); this.onClosed()}, onCompleteScope: this})
    }
}
