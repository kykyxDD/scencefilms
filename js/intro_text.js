function IntroText(cont, skip_event_frames)
{
    this.skip_event_frames = skip_event_frames
    this.cont = cont
    ScreenObject.decorate_element.apply(this.cont)
    this.canvas = document.createElement('canvas')
    this.cont.appendChild(this.canvas)
    
    this.distortionField = []
    this.distortionElementsCount = 10;
    this.centerPointX = 0
    this.centerPointY = 0
    this.distRadus = 150
    
    this.init()
}

IntroText.prototype = {
    
    init: function() {
        this.set_size(900, 350)
        this.prepare()
        this.hide()
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
    
    easeInCubic: function(t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    
    easeOutCubic: function ( t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    
    easeInOutCubic: function ( t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    
    prepare: function() {
        
        var pos,dir;
        
        this.distortionField = new Array();
        this.lenghts = [];
        var minX = 1000000;
        var maxX = -1000000;

        var minY = 1000000;
        var maxY = -1000000;
         
        for(var j=0;j<this.arrLines.length;j++){
            var len = 0;

            for(var i=2;i<this.arrLines[j].length;i+=2){
                
                if(this.arrLines[j][i]>maxX){
                    maxX = this.arrLines[j][i];
                }
                if(this.arrLines[j][i]<minX){
                    minX = this.arrLines[j][i];
                }

                if(this.arrLines[j][i+1]>maxY){
                    maxY = this.arrLines[j][i+1];
                }
                if(this.arrLines[j][i+1]<minY){
                    minY = this.arrLines[j][i+1];
                }

                var dx = this.arrLines[j][i]-this.arrLines[j][i-2];
                var dy = this.arrLines[j][i+1]-this.arrLines[j][i-1];
                var l1 = Math.sqrt(dx*dx+dy*dy);
                len+=l1;
            }

            this.lenghts.push(len);
        }
        
        this.centerPointX = (minX+maxX)/2;
        this.centerPointY = (minY+maxY)/2;
        
        for (var i=0; i<this.distortionElementsCount; i++) {
            pos = new Point;
            dir = new Point;
            var rad = Math.random()*(1000);
            var ang = Math.random()*Math.PI*2;
            pos.x = Math.random()*(maxX-minX)*1.5;
            pos.y = Math.random()*(maxY-minY);

            dir.x = Math.sin(ang)*4;
            dir.y = Math.cos(ang)*4;
            var disObj = new Object();
            disObj.pos = pos;
            disObj.dir = dir;
            disObj.disOut = Math.round(Math.random())*2-1;
            this.distortionField.push(disObj);
        }
    },
    
    updateDistortionField: function() {
        for (var i=0; i<this.distortionField.length; i++) {
            var len = Math.sqrt(this.distortionField[i].pos.x*this.distortionField[i].pos.x + this.distortionField[i].pos.y*this.distortionField[i].pos.y);
            this.distortionField[i].dir.x += -this.distortionField[i].pos.x/len*0.1;
            this.distortionField[i].dir.y += -this.distortionField[i].pos.y/len*0.1;
            this.distortionField[i].pos.x += this.distortionField[i].dir.x;
            this.distortionField[i].pos.y += this.distortionField[i].dir.y;
        }
    },
    
    getDistortion: function (x1,y1) {
        var ret = new Point;
        var nx =x1-this.centerPointX;
        var ny =y1-this.centerPointY;
        ret.x = nx;
        ret.y = ny;
        
        for(var i=0;i<this.distortionField.length;i++){
            //var dx = ret.x - (this.mouseX-loaderGraphic.x)//distortionField[i].pos.x;
            //var dy = ret.y - (this.mouseY-loaderGraphic.y)//distortionField[i].pos.y;
            var dx = ret.x - this.distortionField[i].pos.x;
            var dy = ret.y - this.distortionField[i].pos.y;
            
            var dist = Math.sqrt(dx*dx+dy*dy);
            var rad = this.distRadus;
            if(dist<rad){
                var k =  dist/(rad);
                var str = 1-(Math.cos(k*Math.PI*2)+1)/2;
                //trace(str);
                ret.x+=dx/dist*1*str*this.distortionField[i].disOut;
                ret.y+=dy/dist*1*str*this.distortionField[i].disOut;
            }
        }
        
        return ret;
    },
    
    runRepaint: function() {
        clearInterval(this.repaintInterval)
        this.repaintCanvas()
        this.repaintInterval = setInterval(angular.bind(this, this.repaintCanvas), 30)
    },
    
    stopRepaint: function() {
        clearInterval(this.repaintInterval)
    },
    
    repaintCanvas: function() {
        
        if (this.skip_event_frames) {
            this.skip_frame = !this.skip_frame
            if (this.skip_frame) return
        }
        
        this.updateDistortionField()        
        
        var ctx = this.canvas.getContext('2d')
        //ctx.save()
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        ctx.strokeStyle = "#000000"
        ctx.miterLimit = 1
        ctx.lineCap = "round"
        
        var c = new Point(this.WIDTH/2, this.HEIGHT/2)

        var pnt;
        ctx.beginPath()

        for(var j=0;j<this.arrLines.length;j++){
             var k1 = 1/100*this.percent;
             var lenRequired = this.lenghts[j]*this.easeOutCubic(k1,0,1,1);
             //trace(lenRequired);
             var fin = false;
             var len = 0;
             pnt = this.getDistortion(this.arrLines[j][0], this.arrLines[j][1]);
             ctx.moveTo(c.x + pnt.x, c.y + pnt.y);
             
             for(var i=2; i<this.arrLines[j].length && !fin; i += 2) {
                 var dx = this.arrLines[j][i] - this.arrLines[j][i-2];
                 var dy = this.arrLines[j][i+1] - this.arrLines[j][i-1];
                 var l1 = Math.sqrt(dx*dx+dy*dy);
                 ctx.lineWidth = 7
                 
                 if(lenRequired<=len+l1){
                    var k=(lenRequired-len)/l1;
                    //trace("k=" ,lenRequired,l1, len,k);
                    if(!len){
                        ctx.lineWidth = 7//Math.round(7*k)
                    }
                    pnt = this.getDistortion(this.arrLines[j][i-2]+dx*k, this.arrLines[j][i-1]+dy*k);
                    ctx.lineTo(c.x + pnt.x, c.y + pnt.y);
                    fin = true;
                 }
                 else {
                    pnt = this.getDistortion(this.arrLines[j][i], this.arrLines[j][i+1]);
                    ctx.lineTo(c.x + pnt.x, c.y + pnt.y);
                 }
                 len+=l1;
            }
        }

        ctx.stroke()
        //ctx.restore()
    },
    
    arrLines: [
        [250,562,251,585,252,603,252,609,251,618,251,644,252,646,253,644,252,602],
        [249,562,250,546,250,539,249,531,249,529],
        [234,531,244,531,249,530,256,529,263,529,258,529],
        [284,620,284,643,285,647,285,637,283,600,283,587,282,587,281,567,281,557,280,551,280,538,280,529],
        [284,586,292,586,300,586,306,585,305,567,305,560,304,554,304,529,306,530,305,556],
        [304,584,306,598,307,621,308,648,306,649,305,616,306,586],
        [345,529,332,529,345,528,331,529,329,533,331,542,332,556,332,566],
        [332,642,332,622,332,616,332,603,331,588,331,582,331,564],
        [332,587,343,583,344,586,337,585,331,585],
        [330,647,339,647,352,646,349,645,332,644],
        [414,528,409,525,399,531,395,540,394,551,396,558,400,570,405,580,412,598],
        [408,525,397,533,395,537,393,545,394,560,404,583],
        [411,596,417,615,418,624,417,633,414,640,410,646,404,650,398,651,393,650,391,647,400,651],
        [405,585,411,600,416,612,416,627,410,643],
        [440,610,437,594,439,576,439,562,440,548,441,537,445,532,453,527,459,527,465,528,469,529],
        [439,560,440,573,440,610,440,621,444,634,448,642,454,647,458,648,465,648,471,645,476,643],
        [497,531,503,531,512,531,513,528,497,528,495,532,497,545,498,560,498,570,498,577,497,584,498,585,507,586,512,583,498,582],
        [497,584,497,594,498,615,498,622,499,635,499,649,495,647,498,646,510,647,518,647],
        [497,611,497,633,496,644,500,646],
        [499,648,517,647],
        [538,647,537,615,536,602,536,583,536,563,536,557,537,529,539,528,541,540,545,547,546,548,547,555,549,566,551,578,556,595,563,618,569,636,573,641,572,648,572,643],
        [575,562,575,580,575,596,575,603,575,618,575,623,574,642],
        [574,563,575,549,575,538,574,528,574,525,576,524,575,555],
        [614,605,612,581,612,566,612,556,611,538,610,529],
        [613,604,614,617,612,639,612,642,614,646,614,642,614,602],
        [595,532,604,531,615,530,625,530,623,527,606,528,597,529],
        [666,608,668,619,672,635,677,645,685,650,691,648,695,642],
        [696,546,698,563,699,574,700,594,700,606,700,616,698,630,696,641,691,649],
        [677,526,672,530,670,537,667,551,666,569,666,582,666,600,667,613],
        [677,525,670,531,666,542,666,552,666,563],
        [678,526,687,528,691,533,693,538,696,547],
        [719,531,725,530,730,529,738,529],
        [722,529,723,543,723,553,723,566,724,579,724,586,738,583,737,582,726,585],
        [728,649,727,636,726,613,724,601,724,585],
        [110,688,121,695,125,705,125,718,123,723,121,730,113,737,110,739],
        [109,687,108,705,108,717,108,739,109,756,108,773,109,788,109,808,108,807,108,771],
        [117,735,117,741,120,752,122,763,124,774,131,790,136,806,135,808,133,806,131,793],
        [179,690,173,710,168,731,165,752,161,772,161,778],
        [153,807,155,800,157,789,160,779,163,777,167,777,178,779,188,780],
        [179,690,182,707,184,721,185,736,187,750,188,769,187,778,187,805,189,805,187,765],
        [217,692,216,708,216,722,217,735,217,751],
        [220,808,220,797,219,780,218,762,217,751,216,720,218,748],
        [208,805,214,807,216,806,222,806,232,806,230,804,221,804],
        [208,691,211,691,215,690,221,689,228,689,228,687,217,688],
        [249,732,250,758,251,782,251,803,251,808,253,808,251,773],
        [288,791,288,756,288,726,288,715,288,685,290,685,289,720],
        [288,789,287,797,288,804,287,810,286,801,277,779,270,756,268,751,264,743],
        [249,746,248,721,250,698,252,689,255,698,259,708,261,719,264,732,269,750,276,777],
        [344,697,348,702,349,710,346,719,338,735,332,747,328,761,328,774,332,783,339,789,348,788],
        [342,696,339,700,338,706,338,726,341,747,345,761,349,772,358,784,365,789,371,790,374,788,373,788,366,787],
        [362,751,363,764,361,773,358,780,354,786,349,789,341,789],
        [358,752,363,752,371,752,374,751,373,750,362,751],
        [350,809,342,809,330,808,323,808],
        [349,808,352,808,358,808,372,808],
        [323,685,347,686,365,685,376,684],
        [407,736,409,760,409,785,411,795,409,809,408,807,411,807,426,807],
        [408,791,405,759,406,695,406,686,407,686],
        [408,807,408,780],
        [406,686,407,705,409,724,408,765],
        [451,753,453,778,453,789,453,802,453,808],
        [440,804,445,807,453,806,459,807,465,807,465,805,447,805],
        [450,756,450,725,450,702,450,689],
        [441,692,448,689,451,689,460,687,461,690,451,688],
        [483,745,484,722,485,713,488,702,495,690,501,685,507,684,511,687,505,685,494,691,489,699],
        [483,741,483,754,483,770,484,780,486,793,491,801,496,807,503,810,514,809,519,806,523,800,523,785],
        [524,794,523,778,520,775,508,777,510,777,519,775],
        [521,775,524,793,526,809,524,807,520,781],
        [570,747,571,768,571,780,573,810,571,810,571,774],
        [570,746,556,746,547,746,547,750,547,764,548,778,548,804,550,807,550,803,548,769],
        [546,748,546,730,546,722,545,706,544,690,545,689,546,717],
        [570,746,570,729,569,711,569,697,568,689,569,689,569,706],
        [607,739,608,757,609,766,611,781,610,809,606,807,609,765],
        [607,738,607,724,607,706,607,701,604,689],
        [589,692,593,692,599,690,604,690,613,689,621,688,619,691,607,689],
        [638,749,639,767,639,782,640,808,642,808,639,770],
        [644,698,648,704,650,713,652,725,653,736,662,769,670,794,675,805,673,807,675,795,676,785],
        [678,699,676,686,679,685,679,685,678,706,677,729,677,753,678,779,676,798,675,798,676,781],
        [650,727,647,707,646,701,643,689,639,689,639,695,639,714,638,735,639,752,640,770],
        [672,806,677,807,677,803,678,797,678,773],
        [708,756,706,729,706,715,706,690,707,750,708,776,710,796,710,809,709,809,710,790],
        [697,806,704,807,716,808,722,807,722,806,710,805],
        [696,694,705,690,713,687,717,688,717,690,706,690],
        [697,692,700,690,712,687],
        [740,733,740,764,740,777,741,788,742,809,741,809,740,775],
        [739,735,739,726,739,717,741,687,743,687,743,697,746,701,749,706,750,716,752,721,762,761],
        [757,748,764,770,767,781,770,789,775,802,776,806,775,807,779,796,779,793,778,765,778,751,778,738],
        [778,740,778,725,778,714,778,689,778,686,780,684,780,723],
        [808,697,804,711,802,723,802,737,802,758,802,775,804,790,808,802,814,809,820,811,825,811,832,809,839,804,842,796],
        [826,777,834,775,838,774,840,775,842,788,844,811,843,811,838,778,828,777],
        [807,699,812,692,819,688,827,686,830,687,829,688,820,687]
    ]
}