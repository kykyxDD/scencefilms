var app = angular.module('app', [])
.controller('appController', ['$scope', '$http', '$location', '$document', '$window', function($s, $http, $location, $doc, $window){

    var transition = new Transition($doc[0].querySelector('.transition'))
    var main_menu = new Anim_menu($doc[0].querySelector('#main_menu'))
    var preloader = new Preloader($doc[0].querySelector('#preloader'))
    var intro = new IntroText(document.querySelector("#intro"))

    onResize()
    angular.element($window).bind('resize', onResize)

    $s.selectedPage = 'home'

    $http.get("data.json", {})
    .success(angular.bind(null, function(data, status) {
        $s.data = data

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
        simulate_page_load()
        
        //transition.close()
    }
    
    transition.onClosed = function() {
        transition.show()
        main_menu.show_header(0.3)
    }
    
    function onResize() {
        transition.resize($window.innerWidth, $window.innerHeight)
        preloader.set_size(200, 200)
    }
    
    function simulate_page_load() {
        
        preloader.fake_pc = 0
        
        var f = function() {
            preloader.setPercent(preloader.fake_pc)
            preloader.repaintCanvas()        
        }
        
        f()
        
        TweenLite.to(preloader, 1, {fake_pc: 100, onUpdate: f, onComplete: onPageLoaded, onCompleteScope: this})
    }
    
    function onPageLoaded() {
        preloader.hide()
        transition.close()
    }

    $s.change_page = function(data){
        
        $s.pageToChange = data.page
        
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
}])
.directive('mainmenu', function(){
    
    return {
        
        scope: {
            pages: '=ngModel'        
        },
        template: '<li ng-repeat="page in pages" class="" ng-class="{over: isOver == $index}" ng-mouseover="onOver($index)" ng-mouseout="onOut()">' +
                        '<div class="itm{{$index}}"> {{page.name}} </div>' + 
                        '<div class="cont_line">' + 
                            '<div class="line_menu"></div>' +
                        '</div>' +
                    '</li>',
        link: function(scope, element, attr) {
            scope.isOver = -1;
            scope.onOver = function(index) {
                scope.isOver = index;
            }
            scope.onOut = function() {
                scope.isOver = -1
            }
        }
    } 
})
.directive('transition', function() {
    return {
        scope: {
            ref: "=ref"
        },
        link: function(scope, element, attr) {
            scope.ref = new Transition(element[0])            
        }
    }
})