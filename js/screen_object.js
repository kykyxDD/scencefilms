(function() {

	ScreenObject = {
	
		decorate_object: function() {
			set_defaults_for_object.call(this)
			setup.call(this)
            apply_values.call(this)
            return this
		},
		
		decorate_element: function(do_not_set_defaults) {
            if (!this.__decorated_as_screen_object) {
                this.view = this
                set_defaults_for_element.call(this)
                setup.call(this)
                this.__decorated_as_screen_object = true
            }
            return this
		}
	}

	function set_defaults_for_object() {
    
		var s = window.getComputedStyle(this.view)

        this._x = "x" in this ? this.x : get_integer_from_value(s.getPropertyValue("left")) || this._x
        this._y = "y" in this ? this.y : get_integer_from_value(s.getPropertyValue("top")) || this._y
        this._w = "w" in this ? this.w : get_integer_from_value(s.getPropertyValue("width")) || this._w
        this._h = "h" in this ? this.h : get_integer_from_value(s.getPropertyValue("height")) || this._h
        this._scaleX = 'scaleX' in this ? this.scaleX : 1
        this._scaleY = 'scaleY' in this ? this.scaleY : 1
        this._visible = "visible" in this ? this.visible : true
        this._display = "display" in this ? this.display : true
        this._rotation = "rotation" in this ? this.rotation : 0
        this._alpha = "alpha" in this ? this.alpha : 1
	}

	function set_defaults_for_element() {
		var s = window.getComputedStyle(this.view)
		this._x = this.x || 0
		this._y = this.y || 0
		this._w = get_integer_from_value(s.getPropertyValue("width")) || 0
		this._h = get_integer_from_value(s.getPropertyValue("height")) || 0
        this._scaleX = 'scaleX' in this ? this.scaleX : 1
        this._scaleY = 'scaleY' in this ? this.scaleY : 1
        this._visible = "visible" in this ? this.visible : true
        this._display = "display" in this ? this.display : true
        this._rotation = "rotation" in this ? this.rotation : 0
        this._alpha = "alpha" in this ? this.alpha : 1
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
    
    function update_transform() {
        var str = 'translate(' + this._x + 'px,' + this._y + 'px) scale(' + this._scaleX + ',' + this._scaleY + ') rotate(' + this._rotation + 'deg)'
        this.view.style.webkitTransform = str
        this.view.style.   mozTransform = str
        this.view.style.    msTransform = str
        this.view.style.     OTransform = str
        this.view.style.      transform = str
    }
    
    function set_x (value){
        this._x = value
        this.update_transform()
	}
    
    function get_x(){
		return this._x
    }
    
    function set_y (value){
        this._y = value
        this.update_transform()
	}
    
    function get_y(){
        return this._y
    }
    
    function set_scaleX (value){
        this._scaleX = value
        this.update_transform()
	}
    
    function get_scaleX(){
        return this._scaleX
    }
    
    function set_scaleY (value){
        this._scaleY = value
        this.update_transform()
	}
    
    function get_scaleY(){
        return this._scaleY
    }
    
    function set_rotation (value){
        this._rotation = value
        this.update_transform()
	}
    
    function get_rotation(){
        return this._rotation
    }
    
    function set_alpha (value){
        this._alpha = value
        this.view.style.opacity = this._alpha
	}
    
    function get_alpha(){
        return this._alpha
    }

	function setup() {
    
        this.update_transform = update_transform
    
		this.set_rotation = set_rotation
		this.get_rotation = get_rotation
    
		this.get_x = get_x
		this.set_x = set_x
		
		this.get_y = get_y
		this.set_y = set_y
        
        this.get_scaleX = get_scaleX
        this.set_scaleX = set_scaleX
        
        this.get_scaleY = get_scaleY
        this.set_scaleY = set_scaleY
        
        this.get_alpha = get_alpha
        this.set_alpha = set_alpha
		
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
		Object.defineProperty(this, 'rotation'  , { get: this.get_rotation  , set: this.set_rotation, configurable: true   })
		Object.defineProperty(this, 'scaleX'  , { get: this.get_scaleX  , set: this.set_scaleX, configurable: true   })
		Object.defineProperty(this, 'scaleY'  , { get: this.get_scaleY  , set: this.set_scaleY, configurable: true   })
		Object.defineProperty(this, 'visible'  , { get: this.get_visible  , set: this.set_visible, configurable: true   })
		Object.defineProperty(this, 'display'  , { get: this.get_display  , set: this.set_display, configurable: true   })
		Object.defineProperty(this, 'alpha'  , { get: this.get_alpha  , set: this.set_alpha, configurable: true   })

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
