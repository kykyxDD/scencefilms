(function() {

	ScreenObject = {
	
		decorate_object: function() {
			set_defaults_for_object.call(this)
			setup.call(this)
            apply_values.call(this)
            return this
		},
		
		decorate_element: function(do_not_set_defaults) {
			this.view = this
			//set_defaults_for_object.call(this)
			set_defaults_for_element.call(this)
			setup.call(this)
            return this
		}
	}

	function set_defaults_for_object() {
    
		var s = window.getComputedStyle(this.view)

        this._x = "x" in this ? this.x : get_integer_from_value(s.getPropertyValue("left")) || this._x
        this._y = "y" in this ? this.y : get_integer_from_value(s.getPropertyValue("top")) || this._y
        this._w = "w" in this ? this.w : get_integer_from_value(s.getPropertyValue("width")) || this._w
        this._h = "h" in this ? this.h : get_integer_from_value(s.getPropertyValue("height")) || this._h
        this._visible = "visible" in this ? this.visible : true
        this._display = "display" in this ? this.display : true
        //console.log("set default", this._x, this._y, this._w, this._h)
	}

	function set_defaults_for_element() {
		var s = window.getComputedStyle(this.view)
		this._x = get_integer_from_value(s.getPropertyValue("left")) || 0
		this._y = get_integer_from_value(s.getPropertyValue("top")) || 0
		this._w = get_integer_from_value(s.getPropertyValue("width")) || 0
		this._h = get_integer_from_value(s.getPropertyValue("height")) || 0
	}
	
	function get_integer_from_value(val)
	{
		return val == 'auto' ? 0 : parseInt(val)
	}
    
    function apply_values()
    {
        if (this._x != undefined && !isNaN(this._x)) {
            this.x = this._x
        }
        
        if (this._y != undefined && !isNaN(this._y)) {
            this.y = this._y
        }
        
        if (this._w != undefined && !isNaN(this._w)) {
            this.w = this._w
        }
        
        if (this._h != undefined && !isNaN(this._h)) {
            this.h = this._h
        }
        
        this.visible = this._visible
        this.display = this._display
        //console.log("apply values", this.x, this.y, this.w, this.h)
    }

	function setup() {
    
		this.get_x = function (){
			return this._x
		}
		
		this.set_x = function(value){
			this._x = value
            var str = 'translate(' + this._x + 'px,' + this._y + 'px)'
			this.view.style.webkitTransform = str
			this.view.style.   mozTransform = str
			this.view.style.    msTransform = str
			this.view.style.     OTransform = str
			this.view.style.      transform = str
			//this.view.style.left = Math.round(this._x) + 'px'
		}
		
		this.get_y = function(){
			return this._y
		}
		
		this.set_y = function(value){
			this._y = value
            var str = 'translate(' + this._x + 'px,' + this._y + 'px)'
			this.view.style.webkitTransform = str
			this.view.style.   mozTransform = str
			this.view.style.    msTransform = str
			this.view.style.     OTransform = str
			this.view.style.      transform = str
			//this.view.style.top = Math.round(this._y) + 'px'
		}
		
		this.get_top = function(){
			return this._y
		}
		
		this.set_top = function(value){
			this._y = value
			this.view.style.top = this._y + 'px'
		}
		
		this.get_left = function(){
			return this._x
		}
		
		this.set_left = function(value){
			this._x = value
			this.view.style.left = this._x + 'px'
		}
		
		this.get_h = function(){
			return this._h
		}
		
		this.set_h = function(value){
			this._h = value
			this.view.style.height = this._h + 'px'
		}
		
		this.get_w = function(){
			return this._w
		}
		
		this.set_w = function(value){
			this._w = value
			this.view.style.width = this._w + 'px'
		}
		
		this.get_visible = function(){
			return this._visible
		}
		
		this.set_visible = function(value){
            this._visible = value
			this.view.style.visibility = this._visible ? "visible" : "hidden"
		}
		
		this.get_display = function(){
			return this._display
		}
		
		this.set_display = function(value){
            this._display = value
			this.view.style.display = value ? "block" : "none"
		}
		
		Object.defineProperty(this, 'x'  , { get: this.get_x  , set: this.set_x, configurable: true   })
		Object.defineProperty(this, 'y'  , { get: this.get_y  , set: this.set_y, configurable: true   })
		Object.defineProperty(this, 'h'  , { get: this.get_h  , set: this.set_h, configurable: true   })
		Object.defineProperty(this, 'w'  , { get: this.get_w  , set: this.set_w, configurable: true   })
		Object.defineProperty(this, 'visible'  , { get: this.get_visible  , set: this.set_visible, configurable: true   })
		Object.defineProperty(this, 'display'  , { get: this.get_display  , set: this.set_display, configurable: true   })

		this.disable_transitions = function() {
		
			this.view.style.webkitTransition = "none"
			this.view.style.   mozTransition = "none"
			this.view.style.    msTransition = "none"
			this.view.style.     OTransition = "none"
			this.view.style.      transition = "none"
		}

		this.enable_transitions = function() {

			clearTimeout(this.enable_transition_timeout)
			
			var s = this.view.style
			this.enable_transition_timeout = setTimeout(function() {
				s.webkitTransition = "-webkit-transform 0.3s linear 0s"
				s.   mozTransition =    "-moz-transform 0.3s linear 0s"
				s.    msTransition =     "-ms-transform 0.3s linear 0s"
				s.     OTransition =      "-o-transform 0.3s linear 0s"
				s.      transition =         "transform 0.3s linear 0s"
			}, 0)
		}
	}

})()
