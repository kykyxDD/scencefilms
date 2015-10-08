var app = angular.module('app', [])
.service('view', ['$document', function($doc){
    var doc = $doc[0]
    var transition = new Transition(doc.querySelector('.transition'))
    var main_menu = new Anim_menu(doc.querySelector('#main_menu'), true)
    var preloader = new Preloader(doc.querySelector('#preloader'), true)
    var background = new Background(doc.querySelector('#anim_bg'), true)
    var squares = new Squares(doc);
    var particles = new Particles()
    var intro = new IntroText()

    return {
        transition: transition,
        main_menu: main_menu,
        preloader: preloader,
        squares: squares,
        particles: particles,
        intro: intro,
        background: background,
        
        simulate_page_load: function (duration, callback, reset_preloader) {

            var duration = duration || 1
            preloader.fake_pc = reset_preloader ? 0 : preloader.fake_pc
            preloader.show()

            var f = function() {
                preloader.setPercent(preloader.fake_pc)
                preloader.repaintCanvas()
            }

            f()

            TweenLite.to(preloader, duration, {fake_pc: 100, onUpdate: f, onComplete: callback, onCompleteScope: this, ease: Cubic.easeOut})
        }
    }
    
}])

.service('appState', ['$http', function($http){
    return {
        selectedPage: '',
        interfaceVisible: false,
        
        set_selected_page: function(name) {
            this.selectedPage = name
            this.selectedPageData = this.get_page(name)
        },
        
        load_site_data: function(url, callback) {
            
            $http.get(url, {})
            .success(angular.bind(this, function(data, status) {
                
                for (var i=0; i<data.pages.length; i++) {
                    var page = data.pages[i]
                    if ('types' in page) {
                        
                        for (var k=0; k<page.types.length; k++) {
                            var type = page.types[k]
                        
                            for (var j=0; j<page.pages.length; j++) {
                                var itm = page.pages[j]
                                
                                if (type.type == '*' || itm.type == type.type) {
                                    
                                    if ('groupInTypeBy' in page) {
                                        if (type.items == null) {
                                            type.items = [[]]
                                        }
                                        
                                        var last_group = type.items[type.items.length-1]
                                        if (last_group.length >= page.groupInTypeBy) {
                                            last_group = []
                                            type.items.push(last_group)
                                        }
                                        last_group.push(itm)
                                    }
                                    else {
                                        if (type.items == null) {
                                            type.items = []
                                        }
                                        type.items.push(itm)
                                    }                                                                        
                                }
                            }
                        }
                    }
                }
                
                this.data = data
                callback()
            }))
        },
        
        get_page: function(name) {
            for (var i=0; i<this.data.pages.length; i++) {
                var p = this.data.pages[i]
                if (p.page == name) {
                    return p
                }
            }
        }
    }
}])
.controller('appController', ['appState', 'view', '$scope', '$http', '$document', '$location', '$window', 'anchorSmoothScroll', '$timeout', function(state, v, $s, $http, $doc, $loc, $window, anchorSmoothScroll, $t){

    var doc = $doc[0];

    var win_wid = $window.innerWidth;
    var win_heig = $window.innerHeight;

    var orien = (win_wid > win_heig) ? 'landscape' : "portrait"; 

    if((win_wid <= 1024 && orien == 'landscape') || 
       (win_wid <= 768 && orien == 'portrait')){
        state.orientation = orien;
        state.mobile_style = true;
    } else {
        state.orientation = 'desktop';
        state.mobile_style = false;
    }
    
    $s.state = state
    state.load_site_data("data.json", on_site_data)
    $s.$watch('state.pageToChange', on_page_change)
    
    onResize()
    angular.element($window).on('resize', onResize)
    
    v.simulate_page_load(30, null, true)

    function on_site_data() {
        v.background.init(state.data)
        
        v.main_menu.init(state.data.pages, 0, state.mobile_style)
        state.pageToChange = 'intro'
    }
    
    function on_page_change(new_page, old_page) {
        
        if (new_page) {
        
            if (new_page == 'intro') {
                state.set_selected_page('intro')

            }
            else {
                
                if (old_page == 'intro') {
                    v.background.prepare(state.get_page(new_page).bg_ref)

                    v.background.play2()
                    v.transition.show(state.mobile_style)
                    v.main_menu.show_header(0.3)
                    state.set_selected_page(new_page)
                }
                else {
                    v.main_menu.collapse(state.mobile_style)
                    v.main_menu.hide_header(state.mobile_style)
                    v.transition.open()
                }
            }
        }
    }

    v.main_menu.onClick = function(page) {
        if(page.page !== state.selectedPage) {
            $s.change_page(page);
            $s.$apply()
        }
    }

    v.transition.onOpened = function() {

        state.selectedPage = ""
        $s.$apply();

        v.preloader.show()
        v.preloader.make_white()
        v.simulate_page_load(30, null, true)

        var p = state.get_page(state.pageToChange)
        v.background.prepare(p.bg_ref, true)
        v.background.onLoad = angular.bind(this, on_bg_loaded, onPageLoaded)
    }

    v.transition.onClosed = function() {
        
        state.set_selected_page(state.pageToChange)
        $s.$apply();
        
        v.transition.show(state.mobile_style)
        v.main_menu.show_header(0.3)

        v.background.play()
    }
    
    function on_bg_loaded(callback) {

        v.simulate_page_load(0.3, callback, false)
    }

    $s.goScroll = function (eID){          
        anchorSmoothScroll.scrollTo(eID);
    }

    function onResize(e) {

        var win_wid = $window.innerWidth;
        var win_heig = $window.innerHeight;

        var orien = (win_wid > win_heig) ? 'landscape' : "portrait"; 

        if((win_wid <= 1024 && orien == 'landscape') || 
           (win_wid <= 768 && orien == 'portrait')){

            state.orientation = orien;
            state.mobile_style = true;
        } else {
            state.orientation = 'desktop';
            state.mobile_style = false;
        }
        
        v.transition.resize($window.innerWidth, $window.innerHeight, state.mobile_style)
        v.main_menu.resize(state.mobile_style);
        v.background.resize($window.innerWidth, $window.innerHeight)
        v.preloader.set_size(200, 200)
        
        $t(function(){$s.$apply()})
    }

    function onPageLoaded() {
        $window.scrollTo(0, 0);

        v.preloader.hide()
        v.transition.close()
    }

    $s.change_page = function(data){
        state.pageToChange = data.page;
        $s.nameToChange = data.name;
    }

    $s.onMenuHeaderClick = function() {
        v.main_menu.hide_header(state.mobile_style)
        v.main_menu.expand()
        v.transition.expand(state.mobile_style)
    }

    $s.onMenuCloseClick = function() {
        v.main_menu.align_header();
        v.main_menu.collapse(state.mobile_style);
        v.main_menu.show_header(0.3);
        v.transition.collapse(state.mobile_style);
    }

    $s.readyHtml = function(){
        v.main_menu.align_header();
        v.main_menu.show_header(0.3);
        v.transition.close();
    }
}])
.controller("contentController", ["$scope", "$document", "$window", "$timeout", "appState", "view", function($s, $doc, $w, $t, state, v) {
    
    var doc = $doc[0]


    onResize()
    angular.element($w).on('resize', onResize)
    
    $s.selectedItem = state.selectedPageData.pages[0]

    $s.$on('$destroy', clean_up)
    
    function onResize() {
        var div = doc.querySelector(".b-content")
        div.style.width = state.mobile_style ? '' : Math.round($w.innerWidth*0.66) + "px";
    }

    function clean_up() {
        angular.element($w).off('resize', onResize)
    }
    
    $s.subMenuClick = function(sub_page) {
        $s.selectedItem = sub_page
        v.background.prepare(sub_page.bg_ref)
        v.background.play2()
    }
    
    $s.animateMenuItems = function() {
        
        var items = doc.querySelectorAll(".tab li")
        for (var i=0; i<items.length; i++) {
            var itm = items[i]
            ScreenObject.decorate_element.apply(itm)
            TweenLite.from(itm, 0.5, {x: "-=15", alpha: 0, delay: i*0.1})
        }
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
.controller("mediaController", ["$scope", "$document", "$window", "$timeout", "appState", function($s, $doc, $w, $t, state) {

    var doc = $doc[0];

    if(!state.mobile_style){
        scroll_cont = doc.querySelector(".scrollCont")
        items_cont = scroll_cont.querySelector(":first-child")
    }
   
    var scroll_cont = doc.querySelector(".scrollCont")
    var items_cont = scroll_cont.querySelector(":first-child")
    var media_data = state.selectedPageData
    $s.selectedType = media_data.types[0]
    var scroll = new IScroll(scroll_cont, {scrollX: true, useTransition: false})
    
    angular.element($w).on('resize', onResize)
    $t(onResize)
    
    $s.$on('$destroy', clean_up)
    
    function clean_up() {
        scroll.destroy()
        angular.element($w).off('resize', onResize)
    }

    function onResize() {

        if (!state.mobile_style) {

            var cont_w = $w.innerWidth - 450 + 192;
            var content_w = $s.selectedType.items.length*$s.selectedType.item_width
            scroll_cont.style.width = cont_w + "px"
            items_cont.style.width = content_w + "px"
            scroll.refresh()
        }
    }
    
    $s.animateMenuItems = function() {
        
        var items = doc.querySelectorAll(".tab li")
        for (var i=0; i<items.length; i++) {
            var itm = items[i]
            ScreenObject.decorate_element.apply(itm)
            TweenLite.from(itm, 0.5, {x: "-=15", alpha: 0, delay: i*0.1})
        }
    }
    
    $s.typeMenuClick = function(type) {
        $s.selectedType = type
        $t(onResize)
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
.controller('homeController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state) {


    var doc = $doc[0];

    v.intro.set_canvas(doc.querySelector('#home .screen')) 
    v.intro.runRepaint()

    TweenLite.to(v.intro.canvas, 1, {x: -300})

    v.particles.set_canvas(doc.querySelector('#home .particles'))
    v.particles.init($w.innerWidth, $w.innerHeight)
    v.particles.runRepaint();
    v.squares.init(state.data.homepage_data)

    TweenLite.to(v.particles, 2, {kalpha: 3})
    v.squares.show()
    
    on_resize()
    angular.element($w).on('resize', on_resize)

    $s.$on('$destroy', clean_up)


    function on_resize(e) {

        v.squares.resize(state.mobile_style);

        v.particles.resize(Math.round($w.innerWidth*0.95), Math.round($w.innerHeight*0.95))

        v.intro.canvas.scaleX = v.intro.canvas.scaleY = 0.8;            
        v.intro.canvas.top = $w.innerHeight/2;
        if(e) v.intro.canvas.x = -300; 
        v.intro.canvas.y = 0;
    }

    function clean_up() {
        angular.element($w).off('resize', on_resize)
        v.particles.stopRepaint()
        v.intro.stopRepaint()
    }
}])
.controller('mobileHomeController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state) {

    var doc = $doc[0];

    v.intro.set_canvas(doc.querySelector('#home .screen')) 
    // v.intro.runRepaint()
    v.intro.repaintCanvas();
    var bg_mobile = doc.querySelector('#home .bg_mobile');
    console.log(bg_mobile);
    
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
.controller('introController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state){

    var doc = $doc[0]
    var intro_bg = doc.querySelector('#intro_bg')
    var screen = doc.querySelector('#intro .screen')

    angular.element($w).on('resize', on_resize)

    $s.$on('$destroy', clean_up)

    play_intro()

    function on_resize() {
        if (!v.intro.canvas) return
        
        if(state.mobile_style){
            var scale = ($w.innerWidth/v.intro.canvas.w).toFixed(3);
            var itm_y = $w.innerHeight/2;
            v.intro.canvas.scaleX = v.intro.canvas.scaleY = scale;
            v.intro.canvas.y = itm_y;
        } else {
            v.intro.canvas.scaleX = v.intro.canvas.scaleY = 0.8;
            v.intro.canvas.y = 0;
        }
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
        
        if(state.mobile_style){
            var scale = ($w.innerWidth/screen.w).toFixed(3)
            screen.scaleX = screen.scaleY = scale;
            screen.y = ($w.innerHeight/2)
        }
        
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
.service('anchorSmoothScroll', function(){
    
    this.scrollTo = function(eID) {

        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }
        
        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }
        
        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };
})
.directive('onComplete', function(){
    return {
        link: function($s, el, attr) {
            
            if ($s.$last) {
                $s.$evalAsync(attr.onCompleteCallback);
            }
        }
        
    }
})
.directive('animateText', function(){
    
	function convert_str(str) {
		var column = 0
		
		var text = str.replace(/[\w\W]/g, function(symbol) {
			if(++column > 80 && symbol === ' ') symbol = '\n';
			if(symbol === '\n') column = 0
			return symbol
		});
        
		return text
	}
    
    return {
        scope: {
            text: "=",
            duration: "=",
            delay: "="
        },

        link: function($s, el, attr) {

            var delay = $s.delay || 0
            var duration = $s.duration || 1
            var text = convert_str($s.text)
            var element = el[0]
            
            var obj = {
                
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

            obj.index = 0
            obj.text = text
            obj.timing_for_minuces = 0.8
            obj.field = element
            ScreenObject.decorate_element.apply(element)

            $s.$watch('text', function(new_text, old_text) {
                
                var oh = element.h
                element.style.height = ""
                element.textContent = new_text
                var nh = element.clientHeight
                element.textContent = ""
                TweenLite.killTweensOf(element)
                element.h = oh
                TweenLite.to(element, 1, {h: nh})

                obj.text = new_text
                obj.index = 0
                run()
                
            })

            $s.$on('$destroy', clean_up)

            function clean_up() {
                TweenLite.killTweensOf(element)
                TweenLite.killTweensOf(obj)
                console.log("kill animator")
            }

            function run() {
                TweenLite.killTweensOf(obj)
                TweenLite.to(obj, duration, {index: 1, onUpdate: angular.bind(obj, obj.update)})
            }
        }
    }
})
