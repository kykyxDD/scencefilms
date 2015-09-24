var app = angular.module('app', [])
.controller('appController', ['$scope', '$http', '$location', '$document', function($s, $http, $location, $doc){

    console.log("controller", $doc)
    
    var transition = new Transition($doc[0].querySelector('.transition'))
    var main_menu = new Anim_menu($doc[0].querySelector('#main_menu'))
    
    main_menu.onClick = function(page) {
        // transition.open()
        console.log(page)
        $s.change_page(page)
    }

    $s.change_page = function(page){
        
        main_menu.collapse();
        transition.open();
        console.log('change_page', page);
    }
    
    $s.$on('$locationChangeSuccess', function(event){
        console.log('blah')
    })

    $s.onItemClick = function() {
        console.log("data")        
    }
    
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

    $http.get("data.json", {})
    .success(angular.bind(null, function(data, status){
        console.log("loaded", transition.show())
        $s.data = data
        
        main_menu.init(data.pages, 1)
        main_menu.show_header(0.3)
    }))
    
}])
.directive('mainmenu', function(){
    
    console.log("main_menu")
    
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