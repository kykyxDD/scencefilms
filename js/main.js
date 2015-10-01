var app = angular.module('app', [])
.service('view', ['$document', function($doc){
    var doc = $doc[0]
    var transition = new Transition(doc.querySelector('.transition'))
    var main_menu = new Anim_menu(doc.querySelector('#main_menu'))
    var preloader = new Preloader(doc.querySelector('#preloader'))
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
        intro: intro
    }    
    
}])
.controller('appController', ['view', '$scope', '$http', '$document', '$window', function(v, $s, $http, $doc, $window){

    var doc = $doc[0]
    var video

    $s.mobile_style = true;

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

        create_video($s.data.pages[0].video.files)

        $s.selectedCast = $s.data.pages[2].pages[0]
        $s.selectedMaker = $s.data.pages[3].pages[0]

        $s.$watch('selectedCast', function(cast) {
            if ($s.selectedPage == 'cast') {
                if (cast && 'video' in cast) {
                    create_video(cast.video.files)
                    video.play()
                }
            }
        })

        $s.$watch('selectedMaker', function(maker) {
            if ($s.selectedPage == 'makers') {
                if (maker && 'video' in maker) {
                    create_video(maker.video.files)
                    video.play()
                }
            }
        })
        
        v.squares.init(data.homepage_data)
        v.main_menu.init(data.pages, 0)
        
        if (!v.intro) {
            v.transition.show($s.mobile_style)
            v.main_menu.show_header(0.3)
        }
    }))

    v.main_menu.onClick = function(page) {
        $s.change_page(page);
    }

    v.transition.onOpened = function() {

        $s.selectedPage = $s.pageToChange
        $s.$apply();

        v.preloader.show()
        v.preloader.make_white()
        simulate_page_load(2, onPageLoaded)

        var p = get_page($s.selectedPage)
        if (p.video) {
            create_video(p.video.files)
        }

        //transition.close()
    }

    v.transition.onClosed = function() {
        v.transition.show($s.mobile_style)
        v.main_menu.show_header(0.3)

        video.play()

        if ($s.selectedPage == 'home') {
            v.intro && v.intro.runRepaint()
            v.particles && v.particles.runRepaint()
            v.squares.show();
        }
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
                        console.log("here")
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
        simulate_page_load(1, show_intro_text)

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
    
    function show_intro_text() {
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

        video.play()
        v.transition.show($s.mobile_style)
        v.main_menu.show_header(0.3)
        v.squares.show();
    }

    function onResize(e) {
        var win_wid = $window.innerWidth;
        var win_heig = $window.innerHeight;

        var orientation = (win_wid > win_heig) ? 'landscape' : "portrait"; 

        if((win_wid <= 1024 && orientation == 'portrait') || 
           (win_wid <= 640 && orientation == 'landscape')){
            $s.mobile_style = true;
        } else {
            $s.mobile_style = false;
        }

        v.transition.resize($window.innerWidth, $window.innerHeight)
        v.particles && v.particles.resize(Math.round($window.innerWidth*0.95), Math.round($window.innerHeight*0.95))
        
        var conts = doc.querySelectorAll("#cast .b-content, #makers .b-content")
        
        for (var i=0; i<conts.length; i++) {
            var div = conts[i]
            div.style.width = $s.mobile_style == false ? Math.round($window.innerWidth*0.66) + "px" : '';
        }

        resize_video();

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

    function simulate_page_load(duration, callback) {

        var duration = duration || 1
        v.preloader.fake_pc = 0

        var f = function() {
            v.preloader.setPercent(v.preloader.fake_pc)
            v.preloader.repaintCanvas()
        }

        f()

        TweenLite.to(v.preloader, duration, {fake_pc: 100, onUpdate: f, onComplete: callback, onCompleteScope: this})
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
        v.preloader.hide()
        v.transition.close()
    }

    $s.change_page = function(data){
        $s.pageToChange = data.page;
        $s.nameToChange = data.name;

        v.intro && v.intro.stopRepaint()
        v.particles && v.particles.stopRepaint()
        video.ready && video.remove()

        v.main_menu.collapse()
        v.main_menu.hide_header()
        v.transition.open()
        v.squares.hide();
    }


    $s.onMenuHeaderClick = function() {
        v.main_menu.hide_header()
        v.main_menu.expand()
        v.transition.expand($s.mobile_style)

        // console.log("this?")
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
        hide_intro()
        delete $s.skip_intro
    }
}])

.controller("mediaController", ["$scope", "$document", "$window", function($s, $doc, $window) {
    var media_data
    var doc = $doc[0]
    var scroll_cont = doc.querySelector(".mediaScrollCont")
    var items_cont = scroll_cont.querySelector(".mediaCont")
    var scroll
    
    onResize()
    angular.element($window).bind('resize', onResize)
   
    $s.$watch('data', function(data) {
        
        if (data) {
            media_data = data.pages[4]
            media_data.pages.forEach(groupBy)

            $s.selectedMedia = data.pages[4].pages[0]

            scroll = new IScroll(scroll_cont, {scrollX: true})
            
            onResize()

        }
    })
   
    
    function onResize() {
        if (media_data) {

            var cont_w = $window.innerWidth - 450;
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