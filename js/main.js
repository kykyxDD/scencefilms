var app = angular.module('app', [])
.controller('appController', ['$scope', '$http', '$document', '$window', function($s, $http, $doc, $window){

    var doc = $doc[0]
    var transition = new Transition(doc.querySelector('.transition'))
    var main_menu = new Anim_menu(doc.querySelector('#main_menu'))
    var preloader = new Preloader(doc.querySelector('#preloader'))
    var squares = new Squares(doc);
    var intro_bg = doc.querySelector('#intro_bg')
    
    var video

    $s.mobile_style = true;

    if (intro_bg) {
        var particles = new Particles(doc.querySelector('.paricles'))

        var intro = new IntroText(document.querySelector("#intro"))
        intro.cont.x = 0
        intro.cont.y = 0
        intro.cont.scaleX = intro.cont.scaleY = 0.8
        ScreenObject.decorate_element.apply(intro_bg)

        play_intro()
    }

    $s.selectedPage = 'home'

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
        squares.init(data.homepage_data)
        main_menu.init(data.pages, 0)
        
        if (!intro) {
            transition.show()
            main_menu.show_header(0.3)
        }
    }))

    main_menu.onClick = function(page) {
        $s.change_page(page);
    }

    transition.onOpened = function() {

        $s.selectedPage = $s.pageToChange
        $s.$apply();

        preloader.show()
        preloader.make_white()
        simulate_page_load(2, onPageLoaded)

        var p = get_page($s.selectedPage)
        if (p.video) {
            create_video(p.video.files)
        }

        //transition.close()
    }

    transition.onClosed = function() {
        transition.show()
        main_menu.show_header(0.3)

        video.play()

        if ($s.selectedPage == 'home') {
            intro && intro.runRepaint()
            particles && particles.runRepaint()
            // console.log(particles.runRepaint)
            squares.show();
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
                    console.log('on time', ev)
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
        preloader.show()
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
        preloader.hide()

        intro.show()
        intro.percent = 0
        intro.runRepaint()
        
        TweenLite.to(intro, 5, {
            percent: 100,
            ease: Power0.easeInOut,
            onUpdate: function(){ intro.repaintCanvas() },
            onComplete: hide_intro,
            onCompleteScope: this
        })
    }

    function hide_intro() {
        TweenLite.to(intro_bg, 1, {alpha: 0, onComplete: function() {intro_bg.visible = false}})

        TweenLite.to(intro.cont, 1, {x: -300, onComplete: function(){
            var home_page = doc.querySelector('#home')
            home_page.appendChild(intro.cont)
        }})

        particles.runRepaint()
        TweenLite.to(particles, 2, {kalpha: 3})

        video.play()
        transition.show()
        main_menu.show_header(0.3)
        squares.show();
    }

    function onResize(e) {
        // $s.mobile_style = true;
        var win_wid = $window.innerWidth;
        var win_heig = $window.innerHeight;


        var orientation = (win_wid > win_heig) ? 'landscape' : "portrait"; 

        if((win_wid < 1024 && orientation == 'portrait' ) || 
           (win_wid < 640 && orientation == 'landscape' )){
            $s.mobile_style = true;
        } else {
            $s.mobile_style = false;
        }


        console.log($s.mobile_style, $window.innerWidth, $window.innerHeight)
        transition.resize($window.innerWidth, $window.innerHeight)
        particles && particles.resize(Math.round($window.innerWidth*0.95), Math.round($window.innerHeight*0.95))
        
        var conts = doc.querySelectorAll("#cast .b-content, #makers .b-content")
        
        for (var i=0; i<conts.length; i++) {
            var div = conts[i]
            div.style.width = $s.mobile_style == false ? Math.round($window.innerWidth*0.66) + "px" : '';
        }

        resize_video();

        squares.resize();

        preloader.set_size(200, 200)

        if (e) {
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

    function simulate_page_load(duration, callback) {

        var duration = duration || 1
        preloader.fake_pc = 0
        
        var f = function() {
            preloader.setPercent(preloader.fake_pc)
            preloader.repaintCanvas()
        }

        f()

        TweenLite.to(preloader, duration, {fake_pc: 100, onUpdate: f, onComplete: callback, onCompleteScope: this})
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
        preloader.hide()
        transition.close()
    }

    $s.change_page = function(data){
        $s.pageToChange = data.page

        intro && intro.stopRepaint()
        particles && particles.stopRepaint()
        video.ready && video.remove()

        main_menu.collapse()
        main_menu.hide_header()
        transition.open()
        squares.hide();
    }


    $s.onMenuHeaderClick = function() {
        main_menu.hide_header()
        main_menu.expand()
        transition.expand()

        // console.log("this?")
    }

    $s.onMenuCloseClick = function() {
        main_menu.align_header();
        main_menu.collapse();
        main_menu.show_header(0.3);
        transition.collapse();
    }

    $s.readyHtml = function(){
        main_menu.align_header();
        main_menu.show_header(0.3);
        transition.close();
    }

    $s.changeMaker = function(page) {
        $s.selectedMaker = page
    }

    $s.changeCast = function(page) {
        $s.selectedCast = page
    }
}])

