var app = angular.module('app', [])
.controller('appController', ['$scope', '$http', '$location', '$document', '$window', function($s, $http, $location, $doc, $window){

    var doc = $doc[0]
    var transition = new Transition(doc.querySelector('.transition'))
    var main_menu = new Anim_menu(doc.querySelector('#main_menu'))
    var preloader = new Preloader(doc.querySelector('#preloader'))
    var intro_bg = doc.querySelector('#intro_bg')
    
    if (intro_bg) {
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
        
        $s.selectedMaker = $s.data.pages[3].pages[0]

        transition.show()
        main_menu.init(data.pages, 1)
        main_menu.show_header(0.3)       
        
    }))
    
    main_menu.onClick = function(page) {
        $s.change_page(page);
    }
    
    transition.onOpened = function() {

        $s.selectedPage = $s.pageToChange
        $s.$apply();
        
        preloader.show()
        preloader.make_white()
        simulate_page_load(1, onPageLoaded)
        
        //transition.close()
    }
    
    transition.onClosed = function() {
        transition.show()
        main_menu.show_header(0.3)
        
        if ($s.selectedPage == 'home') {
            intro && intro.runRepaint()            
        }
    }
    
    function play_intro() {
        preloader.show()
        simulate_page_load(1, show_intro_text)
        
        var drops = []
        var duration = 1200
        var drops_count = 20
        var grid_size = $window.innterWidth
        var delay = duration/drops_count
        
        setTimeout(makeDrop, delay)
        
        function makeDrop() {
            
            var border = 50
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
        
        TweenLite.to(intro, 2, {
            percent: 100,
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
    }
    
    function onResize() {
        transition.resize($window.innerWidth, $window.innerHeight)
        preloader.set_size(200, 200)
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
    
    function onPageLoaded() {
        preloader.hide()
        transition.close()
    }

    $s.change_page = function(data){
        
        $s.pageToChange = data.page
        
        intro && intro.stopRepaint()
        
        main_menu.collapse()
        main_menu.hide_header()
        transition.open()
    }

    $s.$on('$locationChangeSuccess', function(event){
        //to do: handle hash change
    })

    $s.onMenuHeaderClick = function() {
        main_menu.hide_header()
        main_menu.expand()
        transition.expand()
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
}])
.controller("castController", ['$scope', function($s) {
    
    $s.$parent.$watch("data", onData)
    
    function onData(n, p) {
        for (var i=0; n && i<n.pages.length; i++) {
            if (n.pages[i].page == 'cast') {
                $s.data = n.pages[i]
                $s.selectedCast = $s.data.pages[0]
                //$s.$apply()
                break
            }
        }
    }
    
    this.changeCast = function(page) {
        $s.selectedCast = page        
    }
}])
