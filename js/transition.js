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
        
        this.WIDTH = 1024
        this.HEIGHT = 800
        this.SQUARE_SIZE = 688
        this.yellow_exp_scale = 1
        this.black_exp_scale = 1
        this.time_scale = 1.25
    
        this.yellow_part = this.cont.querySelector('#yellow_part')
        this.black_part = this.cont.querySelector('#black_part')
        
        ScreenObject.decorate_element.apply(this.cont)
        ScreenObject.decorate_element.apply(this.yellow_part)
        ScreenObject.decorate_element.apply(this.black_part)
        
        this.reset()
        this.show()
    },
    
    resize: function(w, h) {
    
        this.WIDTH = w
        this.HEIGHT = h
    
        if (this.current_state == 'opened') {
            
            this.calc_exp_scale()
            this.yellow_part.scaleX = this.yellow_part.scaleY = this.yellow_exp_scale
            this.black_part.scaleX = this.black_part.scaleY = this.black_exp_scale
        }
    },
    
    calc_exp_scale: function() {
        var tan_a = this.HEIGHT / this.WIDTH
        var projection_a = Math.cos(Math.atan(tan_a)) * this.WIDTH

        var tan_b = this.WIDTH / this.HEIGHT
        var projection_b = Math.cos(Math.atan(tan_b)) * this.HEIGHT
        
        var exp_rad = projection_a //Math.max(projection_a, projection_b)
        var half_size = this.SQUARE_SIZE/2
        this.yellow_exp_scale = exp_rad*2 / half_size
        this.black_exp_scale = (488+exp_rad) / half_size
    },
    
    reset: function() {
    
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

    show: function() {
    
        this.current_state = 'collapsed'
    
        this.cont.x = -469
        this.cont.y = 152;
        console.log(Power1.easeOut)
        TweenLite.to(this.cont, 0.44*this.time_scale, {x: -15, ease: Power1.easeOut, onComplete: function(){this.onShow()}, onCompleteScope: this})
        TweenLite.to(this.cont, 0.5*this.time_scale, {x: 0, ease: Power1.easeOut, delay: 0.44*this.time_scale})
    },
    
    collapse: function() {
        this.current_state = 'collapsed'
        TweenLite.to(this.cont, 0.35*this.time_scale, {y: 167, ease: Power1.easeOut, onComplete: this.onCollapsed, onCompleteScope: this})
        TweenLite.to(this.cont, 1*this.time_scale, {y: 152, ease: Power1.easeOut, delay: 0.35*this.time_scale})
    },
    
    expand: function() {
    
        this.current_state = 'expanded'
        TweenLite.to(this.cont, 0.35*this.time_scale, {y: 275, ease: Power1.easeOut, onComplete: this.onExpanded, onCompleteScope: this})
        TweenLite.to(this.cont, 1*this.time_scale, {y: 310, ease: Power1.easeOut, delay: 0.35*this.time_scale})
    },
    
    open: function() {
        this.current_state = 'opened'
        
        this.calc_exp_scale()
        
        TweenLite.to(this.yellow_part, 0.5*this.time_scale, {scaleX: this.yellow_exp_scale, scaleY: this.yellow_exp_scale})
        TweenLite.to(this.black_part, 0.5*this.time_scale, {scaleX: this.black_exp_scale*0.9, scaleY: this.black_exp_scale*0.9, delay: 0.2*this.time_scale, onComplete: this.onOpened, onCompleteScope: this})
        TweenLite.to(this.black_part, 2*this.time_scale, {scaleX: this.black_exp_scale, scaleY: this.black_exp_scale, delay: 0.7*this.time_scale})
    },
    
    close: function() {
    
        this.current_state = 'closed'
    
        TweenLite.to([this.yellow_part, this.black_part], 0.5*this.time_scale, {scaleX: 0, scaleY: 4, x: 2000, onComplete: function(){this.reset(); this.onClosed()}, onCompleteScope: this})
    }
}
