var app = angular.module('app', ['mobile', 'directives', 'ngSanitize', 'ngSocial'])
.config(function($locationProvider) {
    $locationProvider.html5Mode(false)
    //$locationProvider.hashPrefix('!')
})
.filter('unsafe', ['$sce', function($sce) {
    return $sce.trustAsHtml;
}])
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
            }
            return this.ready.promise
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

.service('navigation', ['$location', function($l) {
    return {
        
        page: function() {
            var path = $l.path()
            if (path == "") {
                return ""
            }
            else {
                var parts = path.split("?")[0].split("/")
                parts.shift()
                return parts[0]
            }
        },
        
        params: function(match) {
            var parts = $l.path().split("?")[0].split("/")
            parts.shift()
            if (parts.length > 1) {
                return parts.splice(1)
            }
            return ""
        }
        
    }
}])
.controller('appController', ['appState', 'view', '$scope', '$http', '$document', '$location', '$window', 'anchorSmoothScroll', '$timeout', 'navigation', function(state, v, $s, $http, $doc, $loc, $window, anchorSmoothScroll, $t, nav){

    var doc = $doc[0];
    $s.w = $window
    $s.state = state
    $s.site_url = $loc.absUrl().replace($loc.url(), "").replace("#", "")
    
    onResize()
    angular.element($window).on('resize', onResize)
    angular.element($window).on('orientationchange', onResize)
    
    v.simulate_page_load(30, null, true)
    
    $s.$watch('state.pageToChange', on_page_change)
    $s.$watch('w.innerWidth', onResize)
    
    state.load().then(on_site_data)
    
    function on_site_data(data) {

        v.background.init(state.data)
        
        var page_name = nav.page()
        var p = state.get_page(page_name)
        
        if (page_name) {
            state.pageToChange = page_name
        }
        else {
            state.pageToChange = 'intro'
        }
        
        if (p) {
            state.nameToChange = p.name
        }

        $s.$on('$locationChangeSuccess', on_location_change)
    }
    
    function on_location_change(ev) {
        var new_page = nav.page()
        
        if (state.pageToChange != new_page) {
            
            var p = state.get_page(new_page)

            if (p) {
                state.nameToChange = p.name
            }

            state.pageToChange = new_page
        }
    }
    
    function on_page_change(new_page, old_page) {
        if (new_page) {
        
            if (new_page == 'intro') {
                state.set_selected_page('intro')
            }
            else {
                
                if (old_page == 'intro' || old_page == '') {
                    if (!state.mobile_style) {
                        var p = state.get_page(new_page)
                        if (p.bg_ref) {
                            v.background.prepare(p.bg_ref)
                            v.background.play2()
                        }
                    }
                    v.transition.show(state.mobile_style)
                    v.main_menu.show_header(0.3)
                    state.set_selected_page(new_page)
                }
                else {
                    v.main_menu.collapse(state.mobile_style, 'hide')
                    v.transition.open()
                    v.background.stop()
                }
                state.interfaceVisible = true
            }
        }
    }

    function onResize(e) {
        
        var win_wid = $window.innerWidth;
        var win_heig = $window.innerHeight;

        state.orien = (win_wid > win_heig) ? 'landscape' : "portrait";

        state.mobile = test_mobile()
        state.tablet = test_table()
        state.desktop = !state.mobile && !state.tablet;

        if(win_wid <= 1050){
            state.mobile_style = true; 
        } else {
            state.mobile_style = false;
        }

        if( 768 <= win_wid && win_wid <= 1280 && state.mobile && !state.tablet){
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

    $s.init_squary = function() {
        v.squares.init(state.data.homepage_data, state.mobile_style, state.tablet, state.orien)
    }

    $s.onMenuHeaderClick = function() {
        if(v.transition.current_state == 'collapsed'){
            v.main_menu.hide_header(state.mobile_style)
            v.main_menu.expand(0.3)
            v.transition.expand(state.mobile_style)
        }
    }

    $s.onMenuCloseClick = function() {
        if(v.transition.current_state == 'expanded'){
            v.transition.collapse(state.mobile_style);
            v.main_menu.collapse(state.mobile_style, 'show');
        }
    }
}])
.controller("desktopController", ["$scope", "$document", "$window", "$timeout", "appState", "view", function($s, $doc, $window, $t, state, v) {

    v.preloader.set_skip_frames(0)

    v.transition.onOpened = function() {

        state.selectedPage = ""
        $s.$apply();
        v.main_menu.stopAll();

        v.preloader.show()
        v.preloader.make_white()

        var p = state.get_page(state.pageToChange)
        if (p.bg_ref) {
            v.background.prepare(p.bg_ref, true)
            v.background.onLoad = angular.bind(this, on_bg_loaded, onPageLoaded)
            v.simulate_page_load(30, null, true)
        }
        else {
            v.background.clear()
            v.simulate_page_load(1, onPageLoaded, true)
        }
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
.controller("contentController", ["$scope", "$document", "$window", "$timeout", "appState", "view", "navigation", function($s, $doc, $w, $t, appState, v, nav) {
    
    var doc = $doc[0]
    var scroll_cont = doc.querySelector('.b-text .text')
    var text_cont = scroll_cont.firstElementChild
    var scroll = new IScroll(scroll_cont, {useTransition: false, scrollbars: true, mouseWheel: true})
    ScreenObject.decorate_element.apply(scroll_cont)
    
    onResize()
    angular.element($w).on('resize', onResize)
    
    selectItem(nav.params()[0])
    
    $s.$on('$locationChangeStart', on_location_change)
    $s.$on('$destroy', clean_up)
    
    function on_location_change(ev) {
        var params = nav.params()

        if (params) {
            var id = nav.params()[0]
            selectItem(id)
        }
    }
    
    function onResize() {
        var div = doc.querySelector(".b-content")
        div.style.width = Math.round($w.innerWidth*0.66) + "px";
        
        text_cont.style.width = Math.round($w.innerWidth - dom.offset(text_cont).x - 60) + "px"
    }

    function clean_up() {
        scroll.destroy()
        angular.element($w).off('resize', onResize)
    }
    
    function selectItem(sub_page) {
        
        if (sub_page) {
            for (var i=0; i<appState.selectedPageData.pages.length; i++) {
                var page = appState.selectedPageData.pages[i]
                if (page.page == sub_page) {
                    $s.selectedItem = page
                    break;
                }
            }
        }
        else {
            $s.selectedItem = appState.selectedPageData.pages[0]
        }

        //$s.$apply()
        v.background.prepare($s.selectedItem.bg_ref)
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
.controller("mediaController", ["$scope", "$document", "$window", "$timeout", "appState", "view", "navigation", function($s, $doc, $w, $t, state, v, nav) {

    var doc = $doc[0];

    var popup
    var scroll_cont = doc.querySelector(".scrollCont")
    var items_cont = scroll_cont.querySelector(":first-child")
    var media_data = state.selectedPageData
    var cache_counter = 0

    var scroll = new IScroll(scroll_cont, {scrollX: true, useTransition: false, mouseWheel: true})
    
    angular.element($w).on('resize', onResize)
    $t(onResize)
    
    $s.$on('$destroy', clean_up)
    $s.$on('$locationChangeStart', on_location_change)
    
    on_location_change()
    
    function on_location_change(ev) {
        var params = nav.params()

        if (params) {
            var type = params[0]
            var id = params[1]
            
            selectType(type)
            
            if (id) {
                $t(showItemPopup, 0, true, id)
            }
            else {
                popup && popup.hide()
            }
            //ev.preventDefault()
        }
        else {
            $s.selectedType = state.selectedPageData.types[0]
        }
    }
    
    function clean_up() {
        popup && popup.destroy()
        scroll.destroy()
        angular.element($w).off('resize', onResize)
    }
    
    function popup_factory(type) {
        if (type == 'news_photo' || type == 'news_video') {
            return new NewsPopup(doc.querySelector('.popup.news'))
        }
        else if (type == 'photo') {
            return new PhotoPopup(doc.querySelector('.popup.photo'))
        }
        else if (type == 'video') {
            return new VideoPopup(doc.querySelector('.popup.video'))
        }
    }

    function selectType(label) {
        
        if (label) {
            for (var i=0; i<state.selectedPageData.types.length; i++) {
                var itm = state.selectedPageData.types[i]
                if (itm.label == label) {
                    $s.selectedType = itm
                    break;
                }
            }
        }
        else {
            $s.selectedType = state.selectedPageData.types[0]
        }
        
        scroll.scrollTo(0)
        $t(onResize)
    }
    
    function showItemPopup(id) {
        
        if (id) {
            for (var i=0; i<state.selectedPageData.pages.length; i++) {
                var itm = state.selectedPageData.pages[i]
                if (itm.id == id) {
                    
                    var target = items_cont.querySelector('#itm'+itm.id)
        
                    if (target && itm) {
                        popup && popup.destroy()
                        popup = popup_factory(itm.type)
                        popup.resize($w.innerWidth, $w.innerHeight)
                        
                        $s.selectedItem = itm
                        popup.show(target, itm)
                    }
                    
                    break;
                }
            }
        }
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
    
    $s.reloadVideoPopup = function(item) {
        
        if (item) {
            
            popup.reload(item)
        }
    }
    
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

    TweenLite.to(v.particles, 2, {kalpha: 3})

    v.squares.player_desktop();
    
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
        v.squares.destroy()
        v.squares.destroy_desktop()
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
