var app = angular.module('app', [])
.controller('appController', ['$scope', '$http', '$location', '$document', '$window', function($s, $http, $location, $doc, $window){

    var doc = $doc[0]
    var transition = new Transition(doc.querySelector('.transition'))
    var main_menu = new Anim_menu(doc.querySelector('#main_menu'))
    var preloader = new Preloader(doc.querySelector('#preloader'))
    var intro_bg = doc.querySelector('#intro_bg')
    var cont_rhom_right = doc.querySelector('#side_page_right');
    var cont_rhom_left = doc.querySelector('#side_page_left');

    var sq_arr_right = [
        {i: 0, j: 3, imgPath:'image/main/5.jpg', 'type':'type'},
        {i: 2, j: 3, imgPath: 'image/main/4.jpg', 'type':'type'},
        {i: 0, j: 2, imgPath: 'image/main/7.jpg', 'type':'type'},
        {i: 1, j: 1, imgPath: 'image/main/1.jpg', 'type':'type'},
        {i: 1, j: 5, imgPath: 'image/main/11.jpg', 'type':'type'}, 
        {i: 1, j: 2, imgPath: 'image/main/6.jpg', 'type':'type'},
        {i: 1, j: 4, imgPath: 'image/main/9.jpg', 'type':'type'},
        {i: 2, j: 2, imgPath: 'image/main/2.jpg', 'type':'type'}, 
        {i: 1, j: 0, imgPath: 'image/main/12.jpg', 'type':'type'}
    ];
    var sq_arr_left = [
        {i: 0, j: 0, imgPath: 'image/main/10.jpg', 'type':'type'}, 
        {i: 1, j: 0, imgPath: 'image/main/3.jpg', 'type':'type'},
        {i: 1, j: 1, imgPath: 'image/main/8.jpg', 'type':'type'} 
    ];
    
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

        $s.selectedMaker = $s.data.pages[3].pages[0]

        main_menu.init(data.pages, 0)
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
            particles && particles.runRepaint()
        }
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
        
        TweenLite.to(intro, 4, {
            percent: 100,
            ease: Power1.easeOut,
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
        add_rhom()
        
        transition.show()
        main_menu.show_header(0.3)       

    }

    function add_rhom(){

        
        // var sq_width = 310
        var sq_width = Math.round(document.body.clientWidth/6);
        var scape_text = 1.45;
        var _delay = 1;

        ScreenObject.decorate_element.apply(cont_rhom_right)
        ScreenObject.decorate_element.apply(cont_rhom_left)
        cont_rhom_right.style.right = Math.round((sq_width*scape_text*3)*0.95) + 'px';
        cont_rhom_left.style.left = Math.round((-sq_width)*0.4) + 'px';
        cont_rhom_left.style.bottom = Math.round((-sq_width)*0.4) + 'px';

        for(var k = 0; k < sq_arr_right.length; k++){
            add_elem(cont_rhom_right , sq_arr_right[k], k);
        }

        for(var k = 0; k < sq_arr_left.length; k++){
            add_elem(cont_rhom_left , sq_arr_left[k], k);
        }

        function add_elem(parent, page, index){

            var itm_arr = page;

            var itm_elem = doc.createElement('div');
            itm_elem.className = 'cont_rhom';
            var rhom_before = doc.createElement('div');
            rhom_before.className = 'rhom_before';
            itm_elem.appendChild(rhom_before);
            var rhom_after =  doc.createElement('div');
            var className = 'rhom_after';
            rhom_after.className = className; 
            rhom_before.appendChild(rhom_after);
            var text = doc.createElement('div');
            text.className = 'text_rhom';

            rhom_after.appendChild(text);
            parent.appendChild(itm_elem);
            ScreenObject.decorate_element.apply(itm_elem);
            ScreenObject.decorate_element.apply(rhom_before);
            ScreenObject.decorate_element.apply(rhom_after);
            ScreenObject.decorate_element.apply(text);
            text.w = sq_width*scape_text;
            text.h = sq_width*scape_text;
          
            text.style.backgroundImage = 'url("'+page.imgPath+'")'; 

            text.style.bottom = Math.round(-sq_width*0.23) + 'px';
            text.style.right = Math.round(-sq_width*0.23) + 'px';

            itm_elem.w = sq_width;
            itm_elem.h = sq_width;

            itm_elem.x = sq_width*itm_arr.i;
            itm_elem.y = sq_width*itm_arr.j;

            rhom_before.scaleX = 0;
            rhom_before.scaleY = 0;

            rhom_after.scaleX = 0;
            rhom_after.scaleY = 0;


            TweenLite.to(rhom_before, _delay, {scaleX: 1 , scaleY: 1 , delay: 0.3*index})
            TweenLite.to(rhom_after, _delay, {scaleX: 1 , scaleY: 1 , delay: (0.3*index)+(_delay*0.5)})
        }

    }
   
    function hide_rhom(){  
        cont_rhom_right.visible = false
        cont_rhom_left .visible =  false    
    }

    function onResize() {
        transition.resize($window.innerWidth, $window.innerHeight)
        particles.resize(Math.round($window.innerWidth*0.95), Math.round($window.innerHeight*0.95))
        
        var conts = doc.querySelectorAll("#cast .b-content, #makers .b-content")
        for (var i=0; i<conts.length; i++) {
            var div = conts[i]
            div.style.width = Math.round($window.innerWidth*0.66) + "px"
        }
        
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
        particles && particles.stopRepaint()
        
        main_menu.collapse()
        main_menu.hide_header()
        transition.open()
        hide_rhom();
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
