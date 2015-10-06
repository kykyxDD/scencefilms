var app = angular.module('app', [])
.service('view', ['$document', function($doc){
    var doc = $doc[0]
    var transition = new Transition(doc.querySelector('.transition'))
    var main_menu = new Anim_menu(doc.querySelector('#main_menu'), true)
    var preloader = new Preloader(doc.querySelector('#preloader'), true)
    var background = new Background(doc.querySelector('#anim_bg'), true)
    var squares = new Squares(doc);
    var intro_bg = doc.querySelector('#intro_bg')
    
    if (intro_bg) {
        var particles = new Particles(doc.querySelector('.paricles'))

        var intro = new IntroText(document.querySelector("#intro"))
        intro.cont.x = 0
        intro.cont.y = 0
        intro.cont.scaleX = intro.cont.scaleY = 0.8
        ScreenObject.decorate_element.apply(intro_bg)
    }

    return {
        transition: transition,
        main_menu: main_menu,
        preloader: preloader,
        squares: squares,
        intro_bg: intro_bg,
        particles: particles,
        intro: intro,
        background: background
    }    
    
}])
.controller('appController', ['view', '$scope', '$http', '$document', '$location', '$window', 'anchorSmoothScroll', function(v, $s, $http, $doc, $loc, $window, anchorSmoothScroll){

    var doc = $doc[0];

    var win_wid = $window.innerWidth;
    var win_heig = $window.innerHeight;

    var orien = (win_wid > win_heig) ? 'landscape' : "portrait"; 

    if((win_wid <= 1024 && orien == 'landscape') || 
       (win_wid <= 768 && orien == 'portrait')){
        $s.orientation = orien;
        $s.mobile_style = true;
    } else {
        $s.orientation = 'desktop';
        $s.mobile_style = false;
    }

    // $s.mobile_style = true;

    if (v.intro_bg) {
        play_intro()
    }

    $s.selectedPage = 'home'
    $s.nameToChange = 'home'

    onResize()
    angular.element($window).bind('resize', onResize)

    $http.get("data.json", {})
    .success(angular.bind(null, function(data, status) {
        
        $s.data = data

        v.background.init($s.data)
        v.background.prepare($s.data.pages[0].bg_ref)
        v.background.onLoad = angular.bind(this, on_bg_loaded, show_intro_text)

        $s.selectedCast = $s.data.pages[2].pages[0]
        $s.selectedMaker = $s.data.pages[3].pages[0]

        $s.$watch('selectedCast', function(cast) {
            if ($s.selectedPage == 'cast') {
                if (cast) {
                    v.background.prepare(cast.bg_ref)
                    v.background.play2()
                }
            }
        })

        $s.$watch('selectedMaker', function(maker) {
            if ($s.selectedPage == 'makers') {
                if (maker) {
                    v.background.prepare(maker.bg_ref)
                    v.background.play2()
                }
            }
        })
        
        v.squares.init(data.homepage_data)
        v.main_menu.init(data.pages, 0, $s.mobile_style)
        
        if (!v.intro) {
            v.transition.show($s.mobile_style)
            v.main_menu.show_header(0.3)
        }
    }))

    v.main_menu.onClick = function(page) {
        if(page.page !== $s.selectedPage) {
            $s.change_page(page);
        }
    }

    v.transition.onOpened = function() {

        $s.selectedPage = $s.pageToChange
        $s.$apply();

        v.preloader.show()
        v.preloader.make_white()
        simulate_page_load(30, null, true)

        var p = get_page($s.selectedPage)
        v.background.prepare(p.bg_ref, true)
        v.background.onLoad = angular.bind(this, on_bg_loaded, onPageLoaded)

        //transition.close()
    }

    v.transition.onClosed = function() {
        v.transition.show($s.mobile_style)
        v.main_menu.show_header(0.3)

        v.background.play()

        if ($s.selectedPage == 'home') {
            v.intro && v.intro.runRepaint()
            v.particles && v.particles.runRepaint()
            v.squares.show();
        }
    }
    
    function on_bg_loaded(callback) {
        simulate_page_load(0.3, callback, false)
    }

    function load_video(files) {
        video.setup(
            {   sources:
                [{   file: files[0] }
                ,{   file: files[1] }
                ,{   file: files[2] }
                ]
            ,   width: $window.innerWidth
            ,   height: $window.innerWidth
            ,   autostart: true
            ,   stretching: "fill"
            ,   events: {
                onTime: function(ev) {
                    if (ev.position > 5.5) {
                        video.pause(true)
                    }
                }
            }
            })
    }
    
    function create_video(files) {

        if (video) {
            video.pause()
            if (video.parentNode) {
                video.parentNode.removeChild(video)
            }
        }

        video = doc.createElement("video")
        //video.setAttribute("autoplay", "autoplay")
        video.setAttribute("width", 1920)
        video.setAttribute("height", 1080)

        for (var i=0; i<files.length; i++) {
            var s = doc.createElement("source")
            s.src = files[i]
            video.appendChild(s)
        }
        ScreenObject.decorate_element.apply(video)
        doc.querySelector("#video-player").appendChild(video)
        ScreenObject.decorate_element.apply(video.parentNode)
    }

    function play_intro() {
        v.preloader.show()
        simulate_page_load(30, null, true)

        var drops = []
        var duration = 1000
        var drops_count = 16
        var grid_size = $window.innterWidth
        var delay = duration/drops_count

        setTimeout(makeDrop, delay)

        function makeDrop() {

            var border = 100
            var rnd_x = border + ($window.innerWidth - border*2) * Math.random()
            var rnd_y = border + ($window.innerHeight - border*2) * Math.random()

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
    $s.goScroll = function (eID){          
            // $loc.hash('top');     
        anchorSmoothScroll.scrollTo(eID);          
       
        // console.log('top');
        // var top = 400;
        // var duration = 2000; //milliseconds
        // $window.scrollTo(0,0)
        // $("body").animate({scrollTop: -100}, 100); 
        // $anchorScroll()
        // $doc.scrollTop(top, duration).then(function() {
        //   console && console.log('You just scrolled to the top!');
        // });
    }
    
    function show_intro_text() {
        $window.scrollTo(0,0)

        v.preloader.hide()

        v.intro.show()
        v.intro.percent = 0
        v.intro.runRepaint()

        
        if($s.mobile_style){
            var scale = ($window.innerWidth/v.intro.cont.w).toFixed(3)
            v.intro.cont.scaleX = v.intro.cont.scaleY = scale;
            v.intro.cont.y = ($window.innerHeight/2)
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
        
        TweenLite.to(v.intro_bg, 1, {alpha: 0, onComplete: function() {v.intro_bg.visible = false}})

        if($s.mobile_style) {
            var itm_y = $window.innerHeight*0.3;
            // v.intro.cont.y = $window.innerWidth*0.2;
            TweenLite.to(v.intro.cont, 1, {y: itm_y, onComplete: function(){
                var home_page = doc.querySelector('#home')
                home_page.appendChild(v.intro.cont)
            }})
        } else {
            TweenLite.to(v.intro.cont, 1, {x: -300, onComplete: function(){
            var home_page = doc.querySelector('#home')
            home_page.appendChild(v.intro.cont)
        }})
        }

        v.particles.runRepaint()
        TweenLite.to(v.particles, 2, {kalpha: 3})

        v.background.play()
        v.transition.show($s.mobile_style)
        v.main_menu.show_header(0.3)
        v.squares.show();
    }

    function onResize(e) {
        var win_wid = $window.innerWidth;
        var win_heig = $window.innerHeight;

        var orien = (win_wid > win_heig) ? 'landscape' : "portrait"; 

        if((win_wid <= 1024 && orien == 'landscape') || 
           (win_wid <= 768 && orien == 'portrait')){

            $s.orientation = orien;
            $s.mobile_style = true;
        } else {
            $s.orientation = 'desktop';
            $s.mobile_style = false;
        }

        v.transition.resize($window.innerWidth, $window.innerHeight, $s.mobile_style)
        v.particles && v.particles.resize(Math.round($window.innerWidth*0.95), Math.round($window.innerHeight*0.95))
        
        var conts = doc.querySelectorAll("#cast .b-content, #makers .b-content")
        
        for (var i=0; i<conts.length; i++) {
            var div = conts[i]
            div.style.width = $s.mobile_style == false ? Math.round($window.innerWidth*0.66) + "px" : '';
        }


        v.main_menu.resize($s.mobile_style);
        v.background.resize($window.innerWidth, $window.innerHeight)
        v.squares.resize($s.mobile_style);
        v.preloader.set_size(200, 200)

        if (e) {
            resize_intro();
            $s.$apply()
        }
    }

    function resize_video() {
        if (video) {
            var w = 1920;
            var h = 1080;
            var k = Math.max($window.innerWidth / w, $window.innerHeight / h);

            video.scaleX = video.scaleY = k;
        }
    }

    function resize_intro(){
        if($s.mobile_style){
            var scale = ($window.innerWidth/v.intro.cont.w).toFixed(3)
            v.intro.cont.scaleX = v.intro.cont.scaleY = scale;
            v.intro.cont.x = 0;
            v.intro.cont.y = $window.innerHeight*0.3;
        } else {
            v.intro.cont.scaleX = v.intro.cont.scaleY = 0.8;
            v.intro.cont.x = -300;
            v.intro.cont.y = 0;
        }
    }

    function simulate_page_load(duration, callback, reset_preloader) {

        var duration = duration || 1
        v.preloader.fake_pc = reset_preloader ? 0 : v.preloader.fake_pc

        var f = function() {
            v.preloader.setPercent(v.preloader.fake_pc)
            v.preloader.repaintCanvas()
        }

        f()

        TweenLite.to(v.preloader, duration, {fake_pc: 100, onUpdate: f, onComplete: callback, onCompleteScope: this, ease: Cubic.easeOut})
    }

    function get_page(name) {
        for (var i=0; i<$s.data.pages.length; i++) {
            var page = $s.data.pages[i]
            if (page.page == $s.selectedPage) {
                return page
            }
        }
    }

    function onPageLoaded() {
        // $window.pageYOffset = 0;
        $window.scrollTo(0, 0);

        v.preloader.hide()
        v.transition.close()
    }

    $s.change_page = function(data){
        $s.pageToChange = data.page;
        $s.nameToChange = data.name;

        v.intro && v.intro.stopRepaint()
        v.particles && v.particles.stopRepaint()

        v.main_menu.collapse()
        v.main_menu.hide_header($s.mobile_style)
        v.transition.open()
        v.squares.hide();
    }


    $s.onMenuHeaderClick = function() {
        v.main_menu.hide_header($s.mobile_style)
        v.main_menu.expand()
        v.transition.expand($s.mobile_style)
    }

    $s.onMenuCloseClick = function() {
        v.main_menu.align_header();
        v.main_menu.collapse();
        v.main_menu.show_header(0.3);
        v.transition.collapse($s.mobile_style);
    }

    $s.readyHtml = function(){
        v.main_menu.align_header();
        v.main_menu.show_header(0.3);
        v.transition.close();
    }

    $s.changeMaker = function(page) {
        $s.selectedMaker = page
    }

    $s.changeCast = function(page) {
        $s.selectedCast = page
    }
 
    $s.skip_intro = function() {
        TweenLite.killTweensOf(v.intro)
        TweenLite.to(v.intro, 1, { percent: 100, ease: Power0.easeInOut, onUpdate: function(){ v.intro.repaintCanvas() }, })
        hide_intro()
    }
}])

.controller("mediaController", ["$scope", "$document", "$window", "$timeout", function($s, $doc, $window, $t) {
    var media_data
    var doc = $doc[0];
    var mobile = $s.mobile_style;
    var scroll_cont
    var items_cont

    if(!mobile){
        scroll_cont = doc.querySelector(".b-photo .scrollCont")
        items_cont = scroll_cont.querySelector(".mediaCont")
    }
    var scroll
    
    onResize()
    angular.element($window).bind('resize', onResize)
   
    $s.$watch('data', function(data) {
        var mobile = $s.mobile_style;
        
        if (data) {
            if((!scroll_cont || !items_cont) && !mobile){
                scroll_cont = doc.querySelector(".b-photo .scrollCont")
                items_cont = scroll_cont.querySelector(".mediaCont")
            }

            media_data = data.pages[4]
            media_data.pages.forEach(groupBy)

            $s.selectedMedia = data.pages[4].pages[0]
            if(!mobile) scroll = new IScroll(scroll_cont, {scrollX: true, useTransition: false})

            $t(onResize)
        }
    })
    
    $s.$watch('selectedPage', function(page) {
        if (page == 'media') {
            $t(onResize)
        }
    })

    function onResize() {
        
        console.log("media on resize")
        
        mobile = $s.mobile_style;
        
        if (media_data && !mobile) {
            if(!scroll_cont || !items_cont || !scroll){
                scroll_cont = doc.querySelector(".b-photo .scrollCont")
                items_cont = scroll_cont.querySelector(".mediaCont")
                scroll = new IScroll(scroll_cont, {scrollX: true, useTransition: false})
            }

            var cont_w = $window.innerWidth - 450 + 192;
            var content_w = $s.selectedMedia.itemGroups.length*450
            scroll_cont.style.width = cont_w + "px"
            items_cont.style.width = content_w + "px"
            scroll.refresh()
        }
    }
    
    function groupBy(arr) {

        var itemsInGroup = 2

        if (!arr) return []

        var grouped_arr = []

        for (var i=0; i<arr.items.length; i++) {

            var itm = arr.items[i]

            if (i % itemsInGroup == 0) {
                var group = []
                grouped_arr.push(group)
            }

            group.push(itm)
        }

        arr.itemGroups = grouped_arr
    }
    
    $s.changeMedia = function(page) {
        $s.selectedMedia = page
    }

}])
.controller('newsController', ['$scope', "$document", "$window", "$timeout", function($s, $doc, $window, $t){
    
    var news_data
    var doc = $doc[0]
    var mobile = $s.mobile_style;
    var scroll_cont
    var items_cont
    if(!mobile){
        scroll_cont = doc.querySelector(".b-news .scrollCont")
        items_cont = scroll_cont.querySelector(".newsCont")
    }
    
    var scroll
    this.selectType = selectType
    
    onResize()
    angular.element($window).bind('resize', onResize)
    
   
    $s.$watch('data', function(data) {
        mobile = $s.mobile_style;

        if (data) {

            if((!scroll_cont || !items_cont) && !mobile){
                scroll_cont = doc.querySelector(".b-news .scrollCont")
                items_cont = scroll_cont.querySelector(".newsCont")
            }

            $s.news_data = data.pages[1]
            $s.news_data.pages.forEach(parseDate)
            if(!mobile) scroll = new IScroll(scroll_cont, {scrollX: true, useTransition: false})

            selectType($s.news_data.types[0].type)
        }
    })
    
    $s.$watch('selectedPage', function(page) {
        if (page == 'news') {
            $t(angular.bind(this, onResize))
        }
    })

    function onResize() {
        mobile = $s.mobile_style;

        if ($s.news_data && !mobile) {
            if(!scroll_cont || !items_cont){
                scroll_cont = doc.querySelector(".b-news .scrollCont")
                items_cont = scroll_cont.querySelector(".newsCont")

                scroll = new IScroll(scroll_cont, {scrollX: true, useTransition: false})
            }

            var cont_w = $window.innerWidth - 450 + 192;
            var content_w = $s.news.length*460
            scroll_cont.style.width = cont_w + "px"
            items_cont.style.width = content_w + "px"
            console.log(cont_w, content_w)
            scroll.refresh()
        }
    }
    
    function selectType(type) {
        $s.selectedNewsType = type
        $s.news = filterByType(type, $s.news_data.pages)
        
        onResize()
    }
    
    function filterByType(type, arr) {
        var arr = []
        return $s.news_data.pages.filter(function(itm) {
            if (type == 'all' || itm.type == type) {
                return itm
            }
        })
    }
    
    function parseDate(item) {
        var date_parts = item.date.split(".")
        item.timestamp = new Date(date_parts[2], date_parts[1], date_parts[0], 0, 0, 0)
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
            console.log(eID, elm)
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };
    
});