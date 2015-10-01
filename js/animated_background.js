function AnimatedBackground(cont)
{
    this.cont = cont
    ScreenObject.decorate_element.apply(this.cont)

    this.canvas = document.createElement('canvas')
    this.cont.appendChild(this.canvas)

    this.percent = 0
    this.lenghts
    this.arrLines
    this.currentIndex = 0
    this.centerPointX
    this.centerPointY
    this.distRadus = 150
    
    this.init()
}

AnimatedBackground.prototype = {
    
    init: function() {
                
    },
    
    prepare: function() {
        var pos,dir;
        
        this.lenghts = [];
        var minX = 1000000;
        var maxX = -1000000;
         
        var minY = 1000000;
        var maxY = -1000000;
        this.arrLines = backgrounds[currentIndex % backgrounds.length];
        
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

    repaint: function() {
        logoSprite.graphics.clear();
        logoSprite.graphics.lineStyle(2,0,1);
        
        var pnt;

         for(var j=0;j<this.arrLines.length;j++){
             var k1 = 1/100*percent;
             var lenRequired = lenghts[j]*easeInOutCubic(k1,0,1,1);

             var fin = false;
             var len =0;
             pnt = getDistortion(arrLines[j][0],arrLines[j][1]);
             logoSprite.graphics.moveTo(pnt.x,pnt.y);
             
             for(var i=2;i<arrLines[j].length && !fin;i+=2){
                 var dx = arrLines[j][i]-arrLines[j][i-2];
                 var dy = arrLines[j][i+1]-arrLines[j][i-1];
                 var l1 = Math.sqrt(dx*dx+dy*dy);

                 if (lenRequired<=len+l1) {
                    var k = (lenRequired-len)/l1;

                    pnt = getDistortion(arrLines[j][i-2]+dx*k,arrLines[j][i-1]+dy*k);
                    logoSprite.graphics.lineTo(pnt.x,pnt.y);
                    fin = true
                 }
                 else {
                    pnt = getDistortion(arrLines[j][i],arrLines[j][i+1]);
                    logoSprite.graphics.lineTo(pnt.x,pnt.y);
                 }
                 
                 len += l1
             }
         }
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