function TextAnimator(target, duration, delay) {
    
    this.field = target
    this.duration = duration || 1
    this.delay = delay || 0
    this.timing_for_minuces = 0.8
}

TextAnimator.prototype = {
    
    stop: function() {
        TweenLite.killTweensOf(this)
    },

    run: function(additional_delay) {
        
        var that = this
        additional_delay = additional_delay || 0
        
        TweenLite.killTweensOf(this)
        that.index = 0
        this.field.innerHTML = ""
        //that.update()
        TweenLite.to(that, that.duration, {index: 1, onUpdate: function() { that.update()}, delay: that.delay + additional_delay})
    },
    
    update: function() {
        this.showLetters(this.index)
    },

    back_update: function() {
        this.showLettersBack(this.index)
    },

    showLetters: function(n) {
        var i
        this.field.innerHTML = ""
        
        /*
        if (n < this.timing_for_minuces) {
            
            var subLen = Math.ceil(this.text.length*n / this.timing_for_minuces)
            
            for (i=0;i<subLen;i++) {
                this.field.innerHTML += text.charCodeAt(i) != 13 ? "-" : "\n"
            }
            
            return;
        }
        */
        
        if (n >= 1) {
            this.field.innerHTML = this.text
            return
        }
        
        var prc = (n-this.timing_for_minuces)/(1-this.timing_for_minuces)
        
        subLen = Math.ceil(this.text.length*prc)
        
        this.field.innerHTML = this.text.substr(0, subLen)
        
        for(i=0; i<=0; i++) {
            this.field.innerHTML += String.fromCharCode(Math.ceil(Math.random()*40)+60)
        }
        
        /*
        for(i=subLen; i<this.text.length;i++) {
            this.field.innerHTML += this.text.charCodeAt(i) != 13 ? "-" : "\n"
        }
        */
    },

    showLettersBack: function(n) {
        var i
        var subLen
        this.field.innerHTML = ""

        if (n < this.timing_for_minuces) {

            subLen = Math.ceil(this.text.length*n / this.timing_for_minuces)

            for (i=0; i<this.text.length; i++) {
                var s = i<subLen ? "-" : " "
                s = this.text.charCodeAt(i) != 13 ? s : "\n"
                this.field.innerHTML += s
            }

            return;
        }

        var prc = (n-this.timing_for_minuces)/(1-this.timing_for_minuces)

        subLen = Math.ceil(this.text.length*prc)

        this.field.innerHTML = this.text.substr(0, subLen)

        for(i=0; i<=0; i++) {
            this.field.innerHTML += String.fromCharCode(Math.ceil(Math.random()*40)+60)
        }
    }
}
