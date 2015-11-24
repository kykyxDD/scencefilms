function AnimatedBackground(cont, skip_event_frames)
{
    this.skip_event_frames = skip_event_frames
    this.cont = cont
    ScreenObject.decorate_element.apply(this.cont)

    this.canvas = document.createElement('canvas')
    ScreenObject.decorate_element.apply(this.canvas)
    this.cont.appendChild(this.canvas)

    this.percent = 0
    this.lenghts
    this.arrLines
    this.centerPointX
    this.centerPointY
    this.distRadus = 150
    
    this.init()
}

AnimatedBackground.prototype = {
    
    init: function() {
        this.set_size(1920, 1080)
    },
    
    show: function() {
        dom.display(this.cont, true)
    },
    
    hide: function() {
        dom.display(this.cont, false)
    },
    
    set_size: function(w, h) {
        this.WIDTH = w
        this.HEIGHT = h
        this.canvas.width = this.WIDTH
        this.canvas.height = this.HEIGHT
    },
    
    prepare: function(lines) {
        var pos,dir;
        
        this.lenghts = [];
        var minX = 1000000;
        var maxX = -1000000;
         
        var minY = 1000000;
        var maxY = -1000000;
        this.arrLines = lines
        
        for (var j=0; j<this.arrLines.length;j++){
            
            var len = 0;
            
            for (var i=2; i<this.arrLines[j].length; i+=2) {
                
                if (this.arrLines[j][i] > maxX){
                    maxX = this.arrLines[j][i];
                }
                
                if(this.arrLines[j][i] < minX){
                    minX = this.arrLines[j][i];
                }
                
                if (this.arrLines[j][i+1] > maxY){
                    maxY = this.arrLines[j][i+1];
                }
                
                if(this.arrLines[j][i+1] < minY){
                    minY = this.arrLines[j][i+1];
                }
                
                var dx = this.arrLines[j][i]-this.arrLines[j][i-2];
                var dy = this.arrLines[j][i+1]-this.arrLines[j][i-1];
                var l1 = Math.sqrt(dx*dx+dy*dy);
                len += l1;
            }
            
            this.lenghts.push(len);
        }
        
        this.centerPointX = (minX+maxX)/2;
        this.centerPointY = (minY+maxY)/2;
    },

    getDistortion: function (x1,y1) {
        var ret = new Point;
        var nx = x1;
        var ny = y1;
        ret.x = nx;
        ret.y = ny;
        
        return ret;
    },
    
    clearCanvas: function() {
        
        var ctx = this.canvas.getContext('2d')
        //ctx.save()
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
    },
    
    repaintCanvas: function() {
        
        if (this.skip_event_frames) {
            this.skip_frame = !this.skip_frame
            if (this.skip_frame) return
        }
        
        var ctx = this.canvas.getContext('2d')
        //ctx.save()
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        ctx.strokeStyle = "#000000"
        ctx.miterLimit = 1
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.beginPath()

        var pnt;
        
         for(var j=0;j<this.arrLines.length;j++){

             var k1 = 1/100*this.percent;
             var lenRequired = this.lenghts[j]*this.easeInOutCubic(k1,0,1,1);

             var fin = false;
             var len = 0;
             pnt = this.getDistortion(this.arrLines[j][0], this.arrLines[j][1]);
             ctx.moveTo(pnt.x,pnt.y);
             
             for (var i=2; i<this.arrLines[j].length && !fin; i+=2){
                 var dx = this.arrLines[j][i] - this.arrLines[j][i-2];
                 var dy = this.arrLines[j][i+1] - this.arrLines[j][i-1];
                 var l1 = Math.sqrt(dx*dx+dy*dy);

                 if (lenRequired <= len + l1) {
                    var k = (lenRequired - len) / l1

                    pnt = this.getDistortion(this.arrLines[j][i-2] + dx*k, this.arrLines[j][i-1] + dy*k)
                    ctx.lineTo(pnt.x,pnt.y);
                    fin = true
                 }
                 else {
                    pnt = this.getDistortion(this.arrLines[j][i], this.arrLines[j][i+1])
                    ctx.lineTo(pnt.x,pnt.y);
                 }
                 
                 len += l1
             }
         }
         
         ctx.stroke()
    },
    
    easeInCubic: function(t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    
    easeOutCubic: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    
    easeInOutCubic: function(t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    }
}
