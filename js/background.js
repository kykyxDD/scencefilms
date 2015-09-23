var pagedistance = 650
var currentOffset = 0
var bg_scale
var background_loaded

var objectArchive
var objectHash

function load_background() {

	var data = [
	
	{
		"name"  : "home",
		// "class" : "home",
		"container" : "topbg",
		"data": [
			{
				"src": "image/home.png"
			}
		]
	},
	{
		"name"  : "filmmakers",
		// "class" : "home",
		"container" : "topbg",
		"data": [
			{
				"src": "image/filmmakers.png"
			}
		]
	}
	{
		"name"  : "news",
		// "class" : "home",
		"container" : "topbg",
		"data": [
			{
				"src": "image/news.case"
			}
		]
	}
	{
		"name"  : "case",
		// "class" : "home",
		"container" : "topbg",
		"data": [
			{
				"src": "image/case.case"
			}
		]
	}
	{
		"name"  : "multimedia",
		// "class" : "home",
		"container" : "topbg",
		"data": [
			{
				"src": "image/multimedia.case"
			}
		]
	}
]

    objectArchive = data

    objectHash = data.reduce(function(heap, conf) {
        heap[conf.name] = conf.data
        return heap
    }, {})

    ImagesLoader.load(objectHash)
}


ImagesLoader.onComplete = function() {

    objectArchive.some(function(conf) {
        var so = ImagesLoader.created_objects[conf.name]
        conf.elem = so
        ScreenObject.decorate_element.call(so)
        objectHash[conf.name] = so

        if (conf.container) {
        	calendar.topbg.appendChild(so)
        	so.className = conf.class
        }


    })

    objectHash

    // objectArchive

    for (var i = 0; i < calendar.pos_img_bg.length; i++) {
    	var itm = calendar.pos_img_bg[i]
    	itm.elem =  objectHash[itm.name]
    };
    
    calendar.getAnimation()

    calendar.remclass(calendar.conteiner, "hide")   

    calendar.hide_div_load_cont()
}
