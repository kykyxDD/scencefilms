angular.module('mobile', [])
app.controller("mobileController", ["$scope", "$document", "$window", "$timeout", "appState", "view", function($s, $doc, $window, $t, state, v) {
    
    v.main_menu.onClick = function(page) {
        if(page.page !== state.selectedPage) {
            $s.change_page(page);
            $s.$apply()
        }
    }

    v.transition.onOpened = function() {

        state.set_selected_page(state.pageToChange)
        $s.$apply();

        v.preloader.show()
        v.preloader.make_white()
        v.simulate_page_load(1, switch_page, true)
    }

    v.transition.onClosed = function() {
        v.transition.show(state.mobile_style)
        v.main_menu.show_header(0.3)
    }
    
    function switch_page() {
        
        $window.scrollTo(0, 0);
        v.preloader.hide()
        v.transition.close()
    }

}])
.controller("mobileContentController", ["$scope", "$document", "$window", "$timeout", "appState", "view", function($s, $doc, $w, $t, state, v) {
    
    var doc = $doc[0]

    onResize()
    angular.element($w).on('resize', onResize)
    
    $s.$on('$destroy', clean_up)
    
    function onResize() {
    }

    function clean_up() {
        angular.element($w).off('resize', onResize)
    }
}])
.controller("mobileMediaController", ["$scope", "$document", "$window", "$timeout", "appState", function($s, $doc, $w, $t, state) {

    var doc = $doc[0];
    var media_data = state.selectedPageData
    $s.selectedType = media_data.types[0]
    
    angular.element($w).on('resize', onResize)
    $t(onResize)
    
    $s.$on('$destroy', clean_up)
    
    function clean_up() {
        angular.element($w).off('resize', onResize)
    }

    function onResize() {
    }
    
    $s.typeMenuClick = function(type) {
        $s.selectedType = type
        $t(onResize)
    }
}])
.controller('mobileHomeController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state) {

    var doc = $doc[0];

    v.intro.set_canvas(doc.querySelector('#home .screen')) 
    // v.intro.runRepaint()
    v.intro.repaintCanvas();
    var bg_mobile = doc.querySelector('#home .bg_mobile');
    
    ScreenObject.decorate_element.apply(bg_mobile);
    bg_mobile.h = $w.innerHeight*0.9;

    var scale = ($w.innerWidth/v.intro.canvas.w).toFixed(3);
    var y_0 = $w.innerHeight/2;
    var y_1 = -0.2*$w.innerHeight;
    v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
    v.intro.canvas.top = y_0;
    TweenLite.to(v.intro.canvas, 3, {y: y_1});

    // v.particles.set_canvas(doc.querySelector('#home .particles'))
    // v.particles.init($w.innerWidth, $w.innerHeight)
    // v.particles.runRepaint();
    v.squares.init(state.data.homepage_data)

    TweenLite.to(v.particles, 2, {kalpha: 3})
    v.squares.show()
    
    on_resize()
    angular.element($w).on('resize', on_resize)

    $s.$on('$destroy', clean_up)

    
    function on_resize(e) {
        v.squares.resize(state.mobile_style);
        // v.particles.resize(Math.round($w.innerWidth*0.95), Math.round($w.innerHeight*0.95))
        v.intro.canvas.left = $w.innerWidth/2;
        bg_mobile.h = $w.innerHeight*0.9;

        var scale = ($w.innerWidth/v.intro.canvas.w).toFixed(3)
        v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
        v.intro.canvas.x = 0;
        var y_0 = $w.innerHeight/2;
        v.intro.canvas.top = y_0;
        if(e) v.intro.canvas.y = y_1;
       
 
    }

    function clean_up() {
        angular.element($w).off('resize', on_resize)
        // v.particles.stopRepaint()
        // v.intro.stopRepaint()
    }
}])
.controller('mobileIntroController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state){

    var doc = $doc[0]
    var intro_bg = doc.querySelector('#intro_bg')
    var screen = doc.querySelector('#intro .screen')

    angular.element($w).on('resize', on_resize)

    $s.$on('$destroy', clean_up)

    play_intro()

    function on_resize() {
        if (!v.intro.canvas) return
        
        var scale = ($w.innerWidth/v.intro.canvas.w).toFixed(3);
        var itm_y = $w.innerHeight/2;
        v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
        v.intro.canvas.y = itm_y;
    }

    function clean_up() {
        angular.element($w).off('resize', on_resize)
    }

    $s.skip_intro = function() {
        TweenLite.killTweensOf(v.intro)
        TweenLite.to(v.intro, 0.3, { percent: 100, ease: Power0.easeInOut, onUpdate: function(){ v.intro.repaintCanvas() }, onComplete: hide_intro})
    }

    function play_intro() {
        v.preloader.show()
        v.simulate_page_load(1.5, show_intro_text, false)

        var drops = []
        var duration = 1000
        var drops_count = 16
        var grid_size = $w.innterWidth
        var delay = duration/drops_count

        setTimeout(makeDrop, delay)

        function makeDrop() {

            var border = 100
            var rnd_x = border + ($w.innerWidth - border*2) * Math.random()
            var rnd_y = border + ($w.innerHeight - border*2) * Math.random()

            var drop = doc.createElement("div")
            drop.style.background = "url('image/waterdrops/$.png') no-repeat".replace("$", 1+drops_count%14)
            drop.style.left = Math.round(rnd_x) + "px"
            drop.style.top = Math.round(rnd_y) + "px"
            drop.className = "waterdrop"
            intro_bg.appendChild(drop)

            if (--drops_count > 0) {
                setTimeout(makeDrop, delay)
            }
        }
    }
    
    function show_intro_text() {
        $w.scrollTo(0,0)

        v.preloader.hide()

        v.intro.set_canvas(screen)
        v.intro.set_size(900, 350)
        v.intro.percent = 0
        v.intro.runRepaint()
        
        on_resize()
        
        var scale = ($w.innerWidth/screen.w).toFixed(3)
        screen.scaleX = screen.scaleY = scale;
        screen.y = ($w.innerHeight/2)
        
        TweenLite.to(v.intro, 5, {
            percent: 100,
            ease: Power0.easeInOut,
            onUpdate: function(){ v.intro.repaintCanvas() },
            onComplete: hide_intro,
            onCompleteScope: this
        })
    }

    function hide_intro() {
        delete $s.skip_intro
        v.intro.stopRepaint()
        state.interfaceVisible = true
        state.pageToChange = 'home'
        $s.$apply()
    }
}])
