function Point(x, y) { this.x = x || 0; this.y = y || 0; }
Point.prototype = { length: function() {return Math.sqrt(this.x*this.x + this.y*this.y) }}

function Preloader(cont, skip_frames)
{
    this.cont = cont
    
    this.skip_frames = skip_frames || 0
    this.framesPassed = 0
    
    this.canvas = document.createElement('canvas')
    this.cont.appendChild(this.canvas)
    
    this.label = this.cont.querySelector(".label")
    
    this.innerRadius = 35;
    this.startRadius = this.innerRadius;
    this.circleWidth = 5;
    this.segments = 30;
    this.offsetArr = []
    this.distortionField = []
    this.distortionElementsCount = 8;
    this.percent = 0;
    this.lineBorder = 0;
    this.linecolor = "#000000";
    this.fillcolor = "#000000";
    
    this.init()
}

Preloader.prototype = {
      
    init: function() {
        this.set_size(100, 100)
        this.prepare()
        this.make_white()
        this.hide()
    },
    
    set_skip_frames: function(n) {
        this.skip_frames = n
        this.framesPassed = -1
    },
    
    set_size: function(w, h) {
        this.WIDTH = w
        this.HEIGHT = h
        this.canvas.width = this.WIDTH
        this.canvas.height = this.HEIGHT
    },
    
    set_color: function(val) {
        this.linecolor = val;
        this.fillcolor = val;
    },
    
    make_black: function() {
        this.set_color("#000000")
        dom.addclass(this.cont, "black")
    },
    
    make_white: function() {
        this.set_color("#ffffff")
        dom.addclass(this.cont, "white")
    },
    
    show: function() {
        dom.display(this.cont, true)
    },
    
    hide: function() {
        dom.display(this.cont, false)
    },
    
    prepare: function() {
        
        var pos, dir;
        
        this.offsetArr = []
        
        for (var i=0;i<this.segments;i++) {
            this.offsetArr.push(new Point);
        }
        
        this.distortionField = []
        
        for(var i=0;i<this.distortionElementsCount;i++){
            pos = new Point;
            dir = new Point;
            var rad = Math.random()*(this.startRadius + this.circleWidth);
            var ang = Math.random()*Math.PI*2;
            pos.x = Math.sin(ang)*rad;
            pos.y = Math.cos(ang)*rad;
            
            dir.x = Math.sin(ang)*4;
            dir.y = Math.cos(ang)*4;
            var disObj = {}
            disObj.pos = pos;
            disObj.dir = dir;
            disObj.rad = this.innerRadius*2;
            disObj.disOut = Math.round(Math.random())*2-1;
            this.distortionField.push(disObj);            
        }
    },

    setPercent: function(val) {
        this.percent = val
        this.innerRadius = (val/100 + 1)*17;
        this.label.textContent = Math.round(this.percent) + "%"
    },

    getCoord: function(ang,rad) {
        var ret = new Point();
        //var ang = Math.PI/segments*index*2;
        ret.x =  Math.cos(ang)*rad;
        ret.y =  Math.sin(ang)*rad;
        
        var i=0;
        
        for (var i=0; i<this.distortionField.length; i++) {
            
            var dx = ret.x - this.distortionField[i].pos.x;
            var dy = ret.y - this.distortionField[i].pos.y;
            
            var dist = Math.sqrt(dx*dx+dy*dy);
            if (dist < this.distortionField[i].rad){
                var k = dist/(Math.max(this.startRadius, this.innerRadius*2));
                var str = 1-(Math.cos(k*Math.PI*2)+1)/2;

                ret.x += dx/dist*2*str * this.distortionField[i].disOut;
                ret.y += dy/dist*2*str * this.distortionField[i].disOut;
            }
        }
        
        return ret;
    },
    
    updateDistortionField: function() {
        for(var i=0;i<this.distortionField.length;i++){
            var len = Math.sqrt(this.distortionField[i].pos.x*this.distortionField[i].pos.x + this.distortionField[i].pos.y*this.distortionField[i].pos.y);
            this.distortionField[i].dir.x += -this.distortionField[i].pos.x/len*0.1;
            this.distortionField[i].dir.y += -this.distortionField[i].pos.y/len*0.1;
            this.distortionField[i].pos.x += this.distortionField[i].dir.x;
            this.distortionField[i].pos.y += this.distortionField[i].dir.y;
        }
        
    },
    
    repaintCanvas: function() {
        
        if (this.skip_frames) {
            if (this.framesPassed++ % this.skip_frames > 0) {
                return
            }
        }
        
        this.updateDistortionField();
        
        var ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        ctx.strokeStyle = this.linecolor
        ctx.miterLimit = 1
        
        var c = new Point(this.WIDTH/2, this.HEIGHT/2)
        
        //innerline
        ctx.beginPath()
        var pn = this.getCoord(0, this.innerRadius)
        ctx.moveTo(c.x + pn.x, c.y + pn.y)
        
        for(var i=0; i<=this.segments; i++) {
            pn = this.getCoord(Math.PI/this.segments*i*2, this.innerRadius)
            ctx.lineTo(c.x + pn.x, c.y + pn.y)
        }
        ctx.stroke()
        
        //outerLine
        ctx.beginPath()
        pn = this.getCoord(0, this.innerRadius + this.circleWidth)
        ctx.moveTo(c.x + pn.x, c.y + pn.y)
        
        for(var i=0; i<=this.segments; i++) {
            pn = this.getCoord(Math.PI/this.segments*i*2, this.innerRadius + this.circleWidth)
            ctx.lineTo(c.x + pn.x, c.y + pn.y)
        }
        ctx.stroke()
        
        //fill
        ctx.beginPath()
        pn = this.getCoord(-Math.PI/2, this.innerRadius + this.lineBorder);
        ctx.fillStyle = this.fillcolor
        ctx.moveTo(c.x + pn.x, c.y + pn.y);
        var ang = this.percent/100 * (Math.PI*2);
        var steps = Math.floor(ang/(Math.PI/20))+1;
        var stepVal = ang/steps;
        
        for (var i=1; i<=steps; i++){
            pn = this.getCoord(stepVal*i-Math.PI/2, this.innerRadius + this.lineBorder);
            ctx.lineTo(c.x + pn.x, c.y + pn.y);
        }
        for (var i=0; i<=steps; i++){
            pn = this.getCoord(stepVal*(steps-i)-Math.PI/2, this.innerRadius + this.circleWidth - this.lineBorder);
            ctx.lineTo(c.x + pn.x, c.y + pn.y);
        }
        ctx.fill()
    }
}