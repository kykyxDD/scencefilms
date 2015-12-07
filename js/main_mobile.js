angular.module('mobile', [])
app.controller("mobileController", ["$scope", "$document", "$window", "$timeout", "appState", "view","navigation", function($s, $doc, $window, $t, state, v, nav) {

    v.preloader.set_skip_frames(3)

    v.transition.onOpened = function() {
        state.set_selected_page(state.pageToChange)
        $s.$apply();
        v.main_menu.stopAll();

        v.preloader.show()
        v.preloader.make_white()
        v.simulate_page_load(1, switch_page, true)
    }

    v.transition.onClosed = function() {
        v.transition.show(state.mobile_style)
        v.main_menu.show_header(0.3)
    }
    function offset_top(eID) {
        var elm = document.getElementById(eID);
        if (elm) {
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }
        
        return 0
    }

    function switch_page() {
        var params = nav.params();
        if((state.pageToChange === 'cast' || state.pageToChange === 'makers') && params !== ''){
            var top = offset_top(params.pop());
            $window.scrollTo(0, top);
        } else if((state.pageToChange === 'news') && params !== ''){
            var id = params.pop()
            var top = offset_top('itm'+id);

            var data = state.data.pages;
            data.forEach(function(elem){
                if(elem.page == 'news'){
                    elem.pages.forEach(function(pages){
                        if(pages.id == id){
                            pages.read = true;

                            $s.$apply();
                            $t(function(){
                                var top = offset_top('itm'+id)
                                $window.scrollTo(0, top);
                            },300)
                            
                        }
                    })
                }
            })

        } else {
            $window.scrollTo(0, 0);
        }

        v.preloader.hide()
        v.transition.close()
    }

    function fun_btn_top_show(show){
        var elem = $doc[0].querySelector('.btn_top')
        if(show){
            state.btn_show = show
            $s.$apply();
            elem.alpha = 0;
            ScreenObject.decorate_element.apply(elem)
            TweenLite.to(elem, 0.5, {alpha:1});
        } else {
            elem.alpha = 1;
            ScreenObject.decorate_element.apply(elem)
            TweenLite.to(elem, 0.5, {alpha:0});
            state.btn_show = show
            $t(function(){
                $s.$apply();
            },1000)
        }
    }
    $s.read_all = function(itm, type){
        itm.read = true;
        var hash_parts = []
        $window.location.hash = '#/' + state.pageToChange + (type ? '/'+type : '') + '/' + itm.id;
        $t(function(){
            $s.goScroll('itm'+itm.id)
        },300)
        $s.$apply()
    }
    $s.close_all = function(itm){
        itm.read = false;
        $s.$apply(); 
        $t(function(){
            $s.goScroll('itm'+itm.id)
        },500)
    }
    angular.element($window).bind("scroll", function() {
        if(v.transition.current_state == 'expanded'){
            v.transition.collapse(state.mobile_style)
            v.main_menu.collapse(state.mobile_style, 'show');
        }

        if(state.selectedPage == 'news'){
            var scrollTop = $window.pageYOffset || $doc[0].documentElement.scrollTop;
            var show = scrollTop > 100 ? true : false;
            if(state.btn_show !== show){
                fun_btn_top_show(show)
            }
        }
    });


}])
.controller("mobileContentController", ["$scope", "$document", "$window", "$timeout", "appState", "view","navigation", function($s, $doc, $w, $t, state, v, nav) {
    
    var doc = $doc[0]

    onResize()
    angular.element($w).on('resize', onResize)
    
    $s.$on('$destroy', clean_up)

    $s.search_page = function(id){
        $s.goScroll(id)
        var hash = '#/'+state.pageToChange+'/'+id;
        $w.location.hash = hash;
    }

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
    state.btn_show = false
    angular.element($w).on('resize', onResize)
    $t(onResize)
    
    $s.$on('$destroy', clean_up)
    
    function clean_up() {
        angular.element($w).off('resize', onResize)
        var data = state.data.pages;
        data.forEach(function(elem){
            if(elem.page == 'news'){
                elem.pages.forEach(function(pages){
                    pages.read = false;
                })
            }
        })
    }

    function onResize() {
    }
    
    $s.typeMenuClick = function(type) {
        $s.selectedType = type
        $t(onResize)
    }

    $s.showPictureWindow = function(url) {
        window.open(url, "_blank")
    }
}])
.controller('mobileHomeController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state) {

    var doc = $doc[0];

    var canv = doc.querySelector('#home .screen')
    v.intro.set_canvas(canv) 
    v.intro.set_size(900, 350)
    v.intro.set_skip_frames(3)
    v.intro.repaintCanvas();
    var bg_mobile = doc.querySelector('#home .bg_mobile');
    ScreenObject.decorate_element.apply(bg_mobile);
    bg_mobile.h = state.orien == 'portrait' ? $w.innerHeight*0.9 : $w.innerHeight;
    bg_mobile.w = $w.innerWidth;

    var scale = state.orien == 'portrait' ?($w.innerWidth/v.intro.canvas.w).toFixed(3) : (($w.innerHeight/v.intro.canvas.h)*0.45).toFixed(3);
    var y_0 = $w.innerHeight/2;
    var x_1 = state.orien == 'portrait' ? 0 : -80;
    var y_1 = state.orien == 'portrait' ? -0.2*$w.innerHeight : 0;

    v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
    v.intro.canvas.top = y_0;    
    v.intro.canvas.x = 0;
    TweenLite.to(v.intro.canvas, 3, {x: x_1, y: y_1});

    TweenLite.to(v.particles, 2, {kalpha: 3})

    on_resize()
    angular.element($w).on('resize', on_resize)

    $s.$on('$destroy', clean_up)
    
    function on_resize(e) {

        v.squares.resize(state.mobile_style, state.tablet, state.orien);
        v.intro.canvas.left = $w.innerWidth/2;
        bg_mobile.h = state.orien == 'portrait' ? $w.innerHeight*0.9 : $w.innerHeight;
        bg_mobile.w = $w.innerWidth;
        x_1 = state.orien == 'portrait' ? 0 : -80;
        y_1 = state.orien == 'portrait' ? -0.2*$w.innerHeight : 0;

        var scale = state.orien == 'portrait' ?($w.innerWidth/v.intro.canvas.w).toFixed(3) : (($w.innerHeight/v.intro.canvas.h)*0.45).toFixed(3);
        v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
        var y_0 = $w.innerHeight/2;
        v.intro.canvas.top = y_0;
        if (e) {
            TweenLite.killTweensOf(v.intro.canvas)
            v.intro.canvas.x = x_1;
            v.intro.canvas.y = y_1;

            if (state.orien == 'landscape' && state.selectedPage == 'home'){
                $w.scrollTo(0, 0);
            }
        }
    }

    function clean_up() {
        angular.element($w).off('resize', on_resize)
        v.squares.destroy()
    }
}])
.controller('mobileTabletHomeController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state) {

    var doc = $doc[0];

    v.intro.set_canvas(doc.querySelector('#home .screen')) 
    v.intro.set_size(900, 350)
    v.intro.set_skip_frames(3)
    v.intro.repaintCanvas();
    var bg_mobile = doc.querySelector('#home .bg_mobile');
    ScreenObject.decorate_element.apply(bg_mobile);
    bg_mobile.h = $w.innerHeight;
    bg_mobile.w = $w.innerWidth;

    var scale =  0.7 ;
    var y_0 = $w.innerHeight/2;
    var y_1 = -0.2*$w.innerHeight;
    v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
    v.intro.canvas.top = y_0;
    v.intro.canvas.y = 0;
    var x_0 = $w.innerWidth > $w.innerHeight ? -200 : 0;
    TweenLite.to(v.intro.canvas, 3, {x: x_0});


    TweenLite.to(v.particles, 2, {kalpha: 3})

    on_resize()
    angular.element($w).on('resize', on_resize)

    $s.$on('$destroy', clean_up)
    
    function on_resize(e) {
        v.squares.resize(state.mobile_style, state.tablet, state.orien);
        v.intro.canvas.left = $w.innerWidth/2;
        bg_mobile.h = $w.innerHeight;
        bg_mobile.w = $w.innerWidth;
        y_1 = -0.2*$w.innerHeight;

        var scale = 0.7
        v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
        var y_0 = $w.innerHeight/2;
        v.intro.canvas.top = y_0;
        if(e) {
            v.intro.canvas.x = $w.innerWidth > $w.innerHeight ? -200 : 0;
            v.intro.canvas.y = 0;
        } 

    }

    function clean_up() {
        angular.element($w).off('resize', on_resize)
        v.squares.destroy()
    }
}])
.controller('mobileIntroController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state){

    var doc = $doc[0]
    var intro_bg = doc.querySelector('#intro_bg')
    var screen = doc.querySelector('#intro .screen')
    
    v.intro.set_skip_frames(3)

    angular.element($w).on('resize', on_resize)

    $s.$on('$destroy', clean_up)

    play_intro()

    function on_resize() {
        if (!v.intro.canvas) return
        scale = 0.7; 
        if(!state.tablet){
            scale = state.orien == 'portrait' ?($w.innerWidth/v.intro.canvas.w).toFixed(3) : (($w.innerHeight/v.intro.canvas.h)*0.45).toFixed(3);
        }
        v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
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
    }
    
    function show_intro_text() {
        $w.scrollTo(0,0)

        v.preloader.hide()

        v.intro.set_canvas(screen)
        v.intro.set_size(900, 350)
        v.intro.percent = 0
        v.intro.runRepaint()
        
        on_resize()

        var scale = 0.7; 
        if(!state.tablet){
            scale = state.orien == 'portrait' ?($w.innerWidth/v.intro.canvas.w).toFixed(3) : (($w.innerHeight/v.intro.canvas.h)*0.45).toFixed(3);
        }

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
}]);
