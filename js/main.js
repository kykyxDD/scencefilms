var app = angular.module('app', ['mobile', 'ngSanitize', 'ui.router'])
.filter('unsafe', ['$sce', function($sce) {
    return $sce.trustAsHtml;
}])
.config(function($stateProvider, $urlRouterProvider){
    
    var resolve = {

        data: ['appState', function(appState) {
            return appState.load()
        }]
    }
    
    $stateProvider
    .state('intro', {
        url: '/intro',
        template: 'intro',
        controller: 'routingController',
        resolve: resolve,
        data: {page: 'intro'}
    })
    .state('home', {
        url: '/home',
        template: 'home',
        controller: 'routingController',
        resolve: resolve,
        data: {page: 'home'}
    })
    .state('news', {
        url: '/news',
        template: 'news',
        controller: 'routingController',
        resolve: resolve,
        data: {page: 'news'}
    })
    .state('news.page', {
        url: '/news/:type/:id',
        parent: 'news',
        template: 'news',
        controller: "mediaController"
    })
    .state('cast', {
        url: '/cast/:id',
        template: "",
        controller: 'routingController',
        resolve: resolve,
        data: {page: 'cast'}
    })
    .state('makers', {
        url: '/makers/:id',
        template: 'makers',
        controller: 'routingController',
        resolve: resolve,
        data: {page: 'makers'}
    })
    .state('media', {
        url: '/media/:type/:id',
        template: 'media',
        controller: 'routingController',
        resolve: resolve,
        data: {page: 'media'}
    })
    
    $urlRouterProvider.otherwise('/intro')
    
})
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
.service('appState', ['$http', '$q', function($http, $q){
    return {
        selectedPage: '',
        interfaceVisible: false,
        ready: $q.defer(),
        
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
                                        
                                        if (type.all_items == null) {
                                            type.all_items = []
                                        }
                                        type.all_items.push(itm)
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
                this.ready.resolve(data)
                callback && callback()
            }))
        },
        
        load: function() {
            var r = this.ready
            if (!this.data) {
                this.load_site_data('data.json')
                return this.ready.promise
            }
            else {
                return this.data
            }            
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
.controller('routingController', ['$scope', '$state', 'appState', 'view', function($s, $state, appState, v){
    
    $s.$watch('state.pageToChange', on_page_change)
    var data = appState.get_page($state.$current.data.page)
    appState.pageToChange = data ? data.page : $state.$current.data.page
    appState.nameToChange = data ? data.name : "";
    console.log("routing controller", appState.pageToChange, appState.nameToChange)
    
    function on_page_change(new_page, old_page) {
        
        if (new_page) {
        
            if (new_page == 'intro') {
                appState.set_selected_page('intro')
            }
            else {
                
                if (old_page == 'intro') {
                    if (!appState.mobile_style) {
                        v.background.prepare(appState.get_page(new_page).bg_ref)
                        v.background.play2()
                    }
                    v.transition.show(appState.mobile_style)
                    v.main_menu.show_header(0.3)
                    appState.set_selected_page(new_page)
                }
                else {
                    v.main_menu.collapse(appState.mobile_style)
                    v.main_menu.hide_header(appState.mobile_style)
                    v.transition.open()
                    v.background.stop()
                }
                appState.interfaceVisible = true
            }
        }
    }
    
}])
.controller('appController', ['appState', 'view', '$scope', '$http', '$document', '$location', '$window', 'anchorSmoothScroll', '$timeout', function(state, v, $s, $http, $doc, $loc, $window, anchorSmoothScroll, $t){

    var doc = $doc[0];

    var win_wid = $window.innerWidth;
    var win_heig = $window.innerHeight;

    var orien = (win_wid > win_heig) ? 'landscape' : "portrait"; 

    state.mobile = test_mobile()
    state.tablet = test_table()
    state.desktop = !state.mobile && !state.tablet;
    

    if(win_wid <= 1280){
        state.mobile_style = true;
    } else {
        state.mobile_style = false;
    }
    if( 768 <= win_wid && win_wid<=1280 && state.mobile && !state.tablet){
        state.tablet = true
        state.mobile_style = true
    }

    $s.state = state
    //state.load_site_data("data.json", on_site_data)
    
    onResize()
    angular.element($window).on('resize', onResize)
    
    v.simulate_page_load(30, null, true)
    
    $s.$watch('state.data', on_site_data)
    
    function on_site_data(data) {
        if (data) {
            v.background.init(state.data)
        }
    }

    function onResize(e) {

        var win_wid = $window.innerWidth;
        var win_heig = $window.innerHeight;

        var orien = (win_wid > win_heig) ? 'landscape' : "portrait"; 

        state.mobile = test_mobile()
        state.tablet = test_table()
        state.desktop = !state.mobile && !state.tablet;
        

        if(win_wid <= 1280){
            state.mobile_style = true; 
        } else {
            state.mobile_style = false;
        }
        if( 768 <= win_wid && win_wid<=1280 && state.mobile && !state.tablet){
            state.tablet = true
            state.mobile_style = true
        }
        
        v.transition.resize($window.innerWidth, $window.innerHeight, state.mobile_style)
        v.main_menu.resize(state.mobile_style);
        v.background.resize($window.innerWidth, $window.innerHeight)
        v.preloader.set_size(200, 200)
        
        $t(function(){$s.$apply()})
    }
    
    function test_mobile() {
        
        var ua = window.navigator.userAgent
        
        if (   ua.match(/Mobile/i)
            || ua.match(/iPhone/i)
            || ua.match(/iPod/i)
            || ua.match(/IEMobile/i)
            || ua.match(/Windows Phone/i)
            || ua.match(/Android/i)
            || ua.match(/BlackBerry/i)
            || ua.match(/webOS/i)) {
            return true
        }
        
        return false
    }
    
    function test_table() {
        
        var ua = window.navigator.userAgent
        
        if (   ua.match(/Tablet/i)
            || ua.match(/iPad/i)
            || ua.match(/Nexus 7/i)
            || ua.match(/Nexus 10/i)
            || ua.match(/KFAPWI/i)) {
            return true
        }
        
        return false
    }

    $s.goScroll = function (eID){          
        anchorSmoothScroll.scrollTo(eID);
    }

    $s.init_menu = function() {
        v.main_menu.init(state.data.pages, 0, state.mobile_style)       
    }

    $s.onMenuHeaderClick = function() {
        v.main_menu.hide_header(state.mobile_style)
        v.main_menu.expand()
        v.transition.expand(state.mobile_style)
    }

    $s.onMenuCloseClick = function() {
        v.main_menu.collapse(state.mobile_style);
        v.main_menu.show_header(0.3);
        v.main_menu.align_header();
        v.transition.collapse(state.mobile_style);
    }
}])
.controller("desktopController", ["$scope", "$document", "$window", "$timeout", "appState", "view", function($s, $doc, $window, $t, state, v) {

    v.preloader.set_skip_frames(0)

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

    function onPageLoaded() {
        
        $window.scrollTo(0, 0);

        v.preloader.hide()
        v.transition.close()
    }
    
}])
.controller("contentController", ["$scope", "$state", "$stateParams", "$document", "$window", "$timeout", "appState", "view", function($s, $state, $stateParams, $doc, $w, $t, appState, v) {
    
    if (!scroll) {
    
        var doc = $doc[0]
        var scroll_cont = doc.querySelector('.b-text .text')
        var text_cont = scroll_cont.firstElementChild
        var scroll = new IScroll(scroll_cont, {useTransition: false, scrollbars: true})

        ScreenObject.decorate_element.apply(scroll_cont)
        
        onResize()
        angular.element($w).on('resize', onResize)
        
        $s.selectedItem = appState.selectedPageData.pages[0]
        
        for (var i=0; i<appState.selectedPageData.pages.length; i++) {
            var page = appState.selectedPageData.pages[i]
            if (page.page == $stateParams.id) {
                $s.selectedItem = page
                break;
            }
            
        }
        
        
        $s.$on('$destroy', clean_up)
    }
    
    console.log($stateParams.id)
    
    function onResize() {
        var div = doc.querySelector(".b-content")
        div.style.width = appState.mobile_style ? '' : Math.round($w.innerWidth*0.66) + "px";
    }

    function clean_up() {
        scroll.destroy()
        angular.element($w).off('resize', onResize)
    }
    
    $s.subMenuClick = function(sub_page) {
        $s.selectedItem = sub_page
        $s.$apply()
        v.background.prepare(sub_page.bg_ref)
        v.background.play2()
    }
    
    $s.update_cont_height = function() {
        var h = Math.min(392, text_cont.clientHeight)
        TweenLite.to(scroll_cont, 1, {h: h})
    }
    
    $s.refresh_scroll = function() {
        scroll.refresh()        
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
.controller("mediaController", ["$scope", "$document", "$window", "$timeout", "appState", "view", function($s, $doc, $w, $t, state, v) {

    var doc = $doc[0];

    var popup
    var scroll_cont = doc.querySelector(".scrollCont")
    var items_cont = scroll_cont.querySelector(":first-child")
    var media_data = state.selectedPageData
    $s.selectedType = media_data.types[0]
    var scroll = new IScroll(scroll_cont, {scrollX: true, useTransition: false})
    
    angular.element($w).on('resize', onResize)
    $t(onResize)
    
    $s.$on('$destroy', clean_up)
    
    function clean_up() {
        popup && popup.destroy()
        scroll.destroy()
        angular.element($w).off('resize', onResize)
    }

    function onResize() {

        var cont_w = $w.innerWidth - 450 + 192;
        var content_w = $s.selectedType.items.length*$s.selectedType.item_width
        scroll_cont.style.width = cont_w + "px"
        items_cont.style.width = content_w + "px"
        scroll.refresh()
        popup && popup.resize($w.innerWidth, $w.innerHeight)
    }
    
    $s.animateMenuItems = function() {
        
        var items = doc.querySelectorAll(".tab li")
        for (var i=0; i<items.length; i++) {
            var itm = items[i]
            ScreenObject.decorate_element.apply(itm)
            TweenLite.from(itm, 0.5, {x: "-=15", alpha: 0, delay: i*0.1})
        }
    }
    
    $s.animateContentItems = function(selector) {
        
        var items = doc.querySelectorAll(selector)
        for (var i=0; i<items.length; i++) {
            var itm = items[i]
            ScreenObject.decorate_element.apply(itm)
            TweenLite.from(itm, 0.3, {x: "-=15", alpha: 0, delay: i*0.1})
        }
    }
    
    $s.typeMenuClick = function(type) {
        $s.selectedType = type
        scroll.scrollTo(0)
        $t(onResize)
    }
    
    $s.showNewsPopup = function(news_item) {
        var target = items_cont.querySelector('#news'+news_item.id)
        
        if (target && news_item) {
            
            popup && popup.destroy()
            popup = new NewsPopup(doc.querySelector('.popup.news'))
            popup.resize($w.innerWidth, $w.innerHeight)
            
            popup.show(target, news_item)
        }
    }
    
    $s.showVideoPopup = function(item) {
        var target = items_cont.querySelector('#video'+item.id)
        
        if (target && item) {
            
            popup && popup.destroy()
            popup = new VideoPopup(doc.querySelector('.popup.video'))
            popup.resize($w.innerWidth, $w.innerHeight)
            
            popup.show(target, item)
        }
    }
    
    $s.reloadVideoPopup = function(item) {
        
        if (item) {
            
            popup.reload(item)
        }
    }
    
    $s.showPhotoPopup = function(item) {
        var target = items_cont.querySelector('#photo'+item.id)
        
        if (target && item) {
            
            popup && popup.destroy()
            popup = new PhotoPopup(doc.querySelector('.popup.photo'))
            popup.resize($w.innerWidth, $w.innerHeight)
            
            popup.show(target, item)
        }
    }
    
    var cache_counter = 0
    
    $s.no_cache = function() {
        return "no_cache" + cache_counter++
    }
    
    $s.closePopup = function() {
        popup.hide()
    }
    
}])
.controller('homeController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state) {

    var doc = $doc[0];

    var slogan = doc.querySelector('.slogan')
    ScreenObject.decorate_element.apply(slogan)
    
    v.intro.set_canvas(doc.querySelector('#home .screen')) 
    v.intro.set_size(900, 350)
    v.intro.runRepaint()

    slogan.x = -300
    TweenLite.from(slogan, 1, {alpha: 0, x: "-=15", delay: 1.5})
    
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
    $s.$watch('state.pageToChange', monitor_page_change)

    
    function monitor_page_change(new_page, old_page) {
        if (new_page != 'home') {
            v.particles.stopRepaint()
            v.intro.stopRepaint()
        }
    }

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
.controller('introController', ['$scope', 'view', '$window', '$document', 'appState', function($s, v, $w, $doc, state){

    var doc = $doc[0]
    var intro_bg = doc.querySelector('#intro_bg')
    var screen = doc.querySelector('#intro .screen')
    v.intro.set_skip_frames(0)

    angular.element($w).on('resize', on_resize)

    $s.$on('$destroy', clean_up)

    play_intro()

    function on_resize() {
        if (!v.intro.canvas) return

        v.intro.canvas.scaleX = v.intro.canvas.scaleY = 0.8;
        v.intro.canvas.y = 0;
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
            delay: "=",
            callback: "&textAnimationFinished",
            callback2: "&textAnimationBegin"
        },

        link: function($s, el, attr) {

            var delay = $s.delay || 0
            var duration = $s.duration || 1
            var text = convert_str($s.text)
            var element = el[0]
            
            var obj = new TextAnimator(element, duration, delay)
            obj.text = text
            ScreenObject.decorate_element.apply(element)

            $s.$watch('text', function(new_text, old_text) {
                
                var oh = element.h
                element.style.height = ""
                element.innerHTML = new_text
                var nh = element.clientHeight
                $s.callback2()
                element.innerHTML = ""
                TweenLite.killTweensOf(element)
                element.h = oh
                TweenLite.to(element, 1, {h: nh, onComplete: $s.callback})

                //obj.delay = 0
                obj.text = new_text
                obj.index = 0
                obj.run()
                
            })

            $s.$on('$destroy', clean_up)

            function clean_up() {
                obj.stop()
            }
        }
    }
})
.directive('animateAlphaShiftX', function() {
  
    return {
        scope: {
            delay: '=',
            shift: '=',
            duration: '='
        },
        link: function($s, el, attr) {
            
            var div = el[0]
            var delay = $s.delay || 0
            var shift = $s.shift || 10
            var duration = $s.duration || 0.3
            
            ScreenObject.decorate_element.apply(div)
            TweenLite.from(div, duration, {alpha: 0, x: "-="+shift, delay: delay})

            $s.$on('$destroy', function() {
                TweenLite.killTweensOf(div)
            })
            
        }
    }
  
})
.directive('animateImageLoad', ['$document', function($doc) {
  
    return {
        scope: {
            w: '=imgW',
            h: '=imgH',
            duration: '=',
            url: '=imgUrl'
        },
        link: function($s, el, attr) {

            var div = el[0]
            var img = div.querySelector("img")
            var duration = $s.duration || 1
            var url = $s.url
            
            if (!img) {
                $doc[0].createElement("img")
                div.appendChild(img)
            }

            ScreenObject.decorate_element.apply(img)
            img.src = url
            img.alpha = 0
            img.onload = function() {

                var w = $s.w || div.clientWidth
                var h = $s.h || div.clientHeight
            
                var k = Math.max(w/img.width, h/img.height)
                img.scaleX = img.scaleY = k
                img.x = (w - img.width*k)/2 - img.width*(1-k)/2
                img.y = (h - img.height*k)/2 - img.height*(1-k)/2
                
                var oversize = 1.1
                var dx = ((w - img.width*k*oversize)/2 - img.x)/2
                var dy = ((h - img.height*k*oversize)/2 - img.y)/2
                
                img.alpha = 1
                TweenLite.from(img, duration, {alpha: 0, ease: Linear.easeNone})
                TweenLite.from(img, duration/2, {x: -dx, y: -dy, scaleX: oversize, scaleY: oversize, ease: Cubic.easeOut})
            }
            
            $s.$on('$destroy', function() {
                delete img.onload
                TweenLite.killTweensOf(img)
            })

        }
    }
  
}])
.directive('tap', ['$document', function($doc) {
    
    var doc = $doc[0]
    
    var x, y
    
    function on(e) {
        e = e.touches ? e.touches[0] : e
        x = e.pageX
        y = e.pageY
    }
    function off(e) {
        e = e.changedTouches ? e.changedTouches[0] : e
        x = Math.abs(e.pageX - x)
        y = Math.abs(e.pageY - y)
        if(x <3 && y <3) {
            var tap = document.createEvent('CustomEvent')
            tap.initCustomEvent('tap', true, true, e)
            e.target.dispatchEvent(tap)
        }
    }
    doc.addEventListener('mousedown',  on, true)
    doc.addEventListener('mouseup',   off, true)
    doc.addEventListener('touchstart', on, true)
    doc.addEventListener('touchend',  off, true)

    return {
        
        scope: {
            tap: "&tap"            
        },
        
        link: function($s, elem, attr) {
            
            elem.on('tap', on_tap)
            $s.$on("$destroy", clean_up)
            
            function on_tap(e) {
                $s.tap()
            }
            
            function clean_up() {
                elem.off('tap', on_tap)
            }
            
        }
        
    }
    
}])