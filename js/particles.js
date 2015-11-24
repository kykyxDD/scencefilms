function Particles(skip_even_frames) {

    this.particlesCount = 100
    this.particlesArray = []
    this.wind = [5,0,0];
    this.skip_even_frames = skip_even_frames
    
    this.oldScreenSizeH = 0;
    this.oldScreenSizeW = 0;
    this.kalpha = 0;
}

Particles.prototype = {
    
    init: function(w, h) {
        this.prepareParticles(w, h)
    },
    
    set_canvas: function(canv) {
        this.canvas = canv
    },
    
    resize: function (w, h) {
        var scrw = w
        var scrh = h
        var kw = this.oldScreenSizeW/scrw;
        var kh = this.oldScreenSizeH/scrh;
        
        for(var i=0;i<this.particlesCount;i++) {
            var obj = this.particlesArray[i];
            if(kw){
                obj.pos[0]/=kw;
                obj.pos[1]/=kh;
                obj.pos[2]/=kh;
            }
            else{
                obj.pos = this.getRandomPosition();
            }
        }
        
        this.canvas.width = w
        this.canvas.height = h
        this.oldScreenSizeW = scrw;
        this.oldScreenSizeH = scrh;
    },
    
    prepareParticles: function(w, h) {
        
        this.particlesArray = []
        this.oldScreenSizeW = w
        this.oldScreenSizeH = h
        
        for(var i=0;i<this.particlesCount;i++){
            var obj = {pos:this.getRandomPosition(), speed:(Math.random()*0.2+0.8), rad:Math.random()*20+20, ang:Math.random()*Math.PI*2,angSpeed:Math.random()*0.1 - 0.05, angRad:Math.random()*Math.PI*2};
            this.particlesArray.push(obj);
        }
    },
    
    getRandomPosition: function() {
        var scrw = this.oldScreenSizeW
        var scrh = this.oldScreenSizeH
        var arr = [];
        arr[0] = scrw*Math.random();
        arr[1] = 200*Math.random()+scrh/2*3;
        var depth = scrh*Math.random();
        arr[2] = depth * Math.random();
        return arr;
    },
    
    updateParticlesPosition: function() {
        var scrw = this.oldScreenSizeW
        for(var i=0;i<this.particlesCount;i++){
            var obj = this.particlesArray[i];
            obj.pos[0] += this.wind[0];
            obj.pos[1] += this.wind[1];
            obj.pos[2] += this.wind[2];
            var k = 200/(obj.pos[2]+200);
            obj.ang += obj.angSpeed;
            obj.angRad +=0.03;
            var rad = Math.cos(obj.angRad)*obj.rad;
            obj.scrx = (obj.pos[0] + rad*Math.cos(obj.ang))*k;
            obj.scry = (obj.pos[1] + rad*Math.sin(obj.ang))*k;
            obj.k = k;
            if(obj.scrx>scrw){
                obj.pos[0] -=scrw/k;
            }
        }
    },
    
    repaintCanvas: function() {

        if (!this.canvas) return
    
        if (this.skip_even_frames) {
            this.skip_frame = !this.skip_frame
            if (this.skip_frame) return
        }
    
        this.updateParticlesPosition()
        
        var c = new Point(0, 0)
    
        var ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, this.oldScreenSizeW, this.oldScreenSizeH)
        ctx.lineCap = "round"
        ctx.lineWidth = 2
        ctx.beginPath()

        for(var i=0; i<this.particlesArray.length; i++){
            var alpha = (this.particlesArray[i].k-0.5)*3*this.kalpha
            ctx.strokeStyle = "rgba(204, 195, 156, 1)"//.replace("alpha", alpha)
            ctx.moveTo(c.x + this.particlesArray[i].scrx,   c.y + this.particlesArray[i].scry);
            ctx.lineTo(c.x + this.particlesArray[i].scrx+1, c.y + this.particlesArray[i].scry);
        }

        ctx.stroke()
    },

    runRepaint: function() {
        clearInterval(this.repaintInterval)
        this.repaintCanvas()
        this.repaintInterval = setInterval(angular.bind(this, this.repaintCanvas), 30)
    },

    stopRepaint: function() {
        clearInterval(this.repaintInterval)
    }
}
