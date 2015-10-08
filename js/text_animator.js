function TextAnimator() {
    
    
}

TextAnimator.prototype = {
    
    update: function() {
        this.showLetters(this.index)
    },

    back_update: function() {
        this.showLettersBack(this.index)
    },

    showLetters: function(n) {
        var i
        this.field.textContent = ""
        
        /*
        if (n < this.timing_for_minuces) {
            
            var subLen = Math.ceil(this.text.length*n / this.timing_for_minuces)
            
            for (i=0;i<subLen;i++) {
                this.field.textContent += text.charCodeAt(i) != 13 ? "-" : "\n"
            }
            
            return;
        }
        */
        
        if (n >= 1) {
            this.field.textContent = this.text
            return
        }
        
        var prc = (n-this.timing_for_minuces)/(1-this.timing_for_minuces)
        
        subLen = Math.ceil(this.text.length*prc)
        
        this.field.textContent = this.text.substr(0, subLen)
        
        for(i=0; i<=0; i++) {
            this.field.textContent += String.fromCharCode(Math.ceil(Math.random()*40)+60)
        }
        
        /*
        for(i=subLen; i<this.text.length;i++) {
            this.field.textContent += this.text.charCodeAt(i) != 13 ? "-" : "\n"
        }
        */
    },

    showLettersBack: function(n) {
        var i
        var subLen
        this.field.textContent = ""

        if (n < this.timing_for_minuces) {

            subLen = Math.ceil(this.text.length*n / this.timing_for_minuces)

            for (i=0; i<this.text.length; i++) {
                var s = i<subLen ? "-" : " "
                s = this.text.charCodeAt(i) != 13 ? s : "\n"
                this.field.textContent += s
            }

            return;
        }

        var prc = (n-this.timing_for_minuces)/(1-this.timing_for_minuces)

        subLen = Math.ceil(this.text.length*prc)

        this.field.textContent = this.text.substr(0, subLen)

        for(i=0; i<=0; i++) {
            this.field.textContent += String.fromCharCode(Math.ceil(Math.random()*40)+60)
        }
    }
}