function NewsPopup(cont) {
    
    this.cont = cont
    
}

NewsPopup.prototype = {

    init: function() {
        this.hide()
    },

    show: function(target) {
        dom.display(this.cont, true)
    },
    
    hide: function() {
        dom.display(this.cont, false)
    },

    resize: function(w, h) {
        
    }

}