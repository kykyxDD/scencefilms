function Squares (cont) {
	var self = this;
	this.cont = cont
	
    this.sq_arr_left;
    this.sq_arr_right;
    this.json;

    this.sq_width = Math.round(document.body.clientWidth/6);
    this.scape_text = 1.45;
    this.delay = 1;

    this.rights = Math.round((this.sq_width*this.scape_text*3)*0.95);
}

Squares.prototype = {
	init: function(page, mobile){

        this.cont_rhom_right = this.cont.querySelector('#side_page_right');
        this.cont_rhom = this.cont_rhom_right.querySelector('.cont_rhom_right');
        this.cont_rhom_left = this.cont.querySelector('#side_page_left');
        

        this.json = page;
        this.sq_arr_right = page.sq_arr_right;
        this.sq_arr_left = page.sq_arr_left;

        ScreenObject.decorate_element.apply(this.cont_rhom_right);
        this.cont_rhom_right.style.right = this.rights + 'px';

        for(var k = 0; k < this.sq_arr_right.length; k++){
            this.create_elem(this.cont_rhom, this.sq_arr_right[k]);
            if(!mobile) this.pos_rhom(this.sq_arr_right[k]);
        }
        
        ScreenObject.decorate_element.apply(this.cont_rhom_left);

        this.cont_rhom_left.style.left = Math.round((-this.sq_width)*0.4) + 'px';
        this.cont_rhom_left.style.bottom = Math.round((-this.sq_width)*0.4) + 'px';

        for(var k = 0; k < this.sq_arr_left.length; k++){
            this.create_elem(this.cont_rhom_left, this.sq_arr_left[k]);
            if(!mobile) this.pos_rhom(this.sq_arr_left[k]);
        }


        this.hide();

        if(mobile){
            this.resize_mobile();
        }
	},

	create_elem: function(parent, page){
		var scape_text = this.scape_text;
		var sq_width = this.sq_width;
        var delay = this.delay

        var itm_elem = document.createElement('div');
        itm_elem.className = 'cont_rhom';
        var rhom_before = document.createElement('div');
        rhom_before.className = 'rhom_before';
        itm_elem.appendChild(rhom_before);
        var rhom_after =  document.createElement('div');
        var className = 'rhom_after';
        rhom_after.className = className; 
        rhom_before.appendChild(rhom_after);
        var text = document.createElement('div');
        text.className = 'text_rhom';
        var content;
        
        if(page.type == 'image'){
            content = document.createElement('img');
            
            content.style.width = '100%';
            content.style.height = '100%';    
        } else if(page.type == 'video'){
            content = document.createElement('iframe');
            content.className = 'video';
            content.id = page.id;
            // content.setAttribute('frameborder', "0")
            // content.setAttribute('allowfullscreen', 'allowfullscreen')
            // content.width="560";
            // content.height="315";

            var player = player = new YT.Player(page.id, {
                height: '390',
                width: '640',
                videoId: page.src,
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
            
        }

        text.appendChild(content);
        // img.src = page.imgPath;
        


        rhom_after.appendChild(text);
        parent.appendChild(itm_elem);
        ScreenObject.decorate_element.apply(itm_elem);
        ScreenObject.decorate_element.apply(rhom_before);
        ScreenObject.decorate_element.apply(rhom_after);
        ScreenObject.decorate_element.apply(text);
        ScreenObject.decorate_element.apply(content);

        page.elem = itm_elem;
        page.elem.rhom_before = rhom_before;
        page.elem.rhom_after = rhom_after;
        page.elem.text_rhom = text;
        page.elem.content = content;
        

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        event.target.playVideo();
      }

      // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.
      var done = false;
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          setTimeout(stopVideo, 6000);
          done = true;
        }
      }
      function stopVideo() {
        player.stopVideo();
      }

    },

    resize: function(mobile){

        if(!this.sq_arr_right || !this.sq_arr_left) return
        
        if(mobile){
            this.resize_mobile();
            return
        }

        this.cont_rhom_right.h = '';
        this.cont_rhom_right.w = '';
        this.cont_rhom_right.y = '';
        this.cont_rhom_right.rotation = '';

        this.sq_width = Math.round(document.body.clientWidth/6);
        this.rights = Math.round((this.sq_width*this.scape_text*3)*0.95);

        this.cont_rhom_right.style.right = this.rights + 'px';
        this.cont_rhom_left.style.left = Math.round((-this.sq_width)*0.4) + 'px';
        this.cont_rhom_left.style.bottom = Math.round((-this.sq_width)*0.4) + 'px';

        for(var k = 0; k < this.sq_arr_right.length; k++){
            this.pos_rhom(this.sq_arr_right[k]);
        }
        for(var k = 0; k < this.sq_arr_left.length; k++){
            this.pos_rhom(this.sq_arr_left[k]);
        }

    },

    pos_rhom: function(page){
    	var scape_text = this.scape_text;
    	var sq_width = this.sq_width;
    	var itm_elem = page.elem;
    	var text = page.elem.text_rhom;
         var content = page.elem.content;

    	text.w = sq_width*scape_text;
        text.h = sq_width*scape_text;

        text.style.bottom = Math.round(-sq_width*0.23) + 'px';
        text.style.right = Math.round(-sq_width*0.23) + 'px';

        itm_elem.w = sq_width;
        itm_elem.h = sq_width;

        itm_elem.x = sq_width*page.i;
        itm_elem.y = sq_width*page.j;
        itm_elem.rotation = 0;
        if(page.type == 'video') {
            var scale = text.h/content.height;
            content.scaleX = content.scaleY = scale;
            
        }
        
    },

    resize_mobile: function(){

        this.cont_rhom_right.style.right = '';
        var win_wid = document.documentElement.clientWidth;
        var wid_elem = Math.floor(win_wid/1.43);
        var l = this.sq_arr_right.length;
        var top_1 = Math.floor(wid_elem*(1 - (Math.PI/4))) + Math.floor(wid_elem*(Math.PI/4));
        var top_2 = Math.floor(win_wid*0.15);

        for (var k = 0; k < l; k++){
            var page = this.sq_arr_right[k];
            var itm_elem = page.elem;
            var text = page.elem.text_rhom;
            var content = page.elem.content;

            itm_elem.w = wid_elem;
            itm_elem.h = wid_elem;

            itm_elem.x = k !== 0 ? (win_wid*0.47)*(k%2) : win_wid*0.15;

            if(k == 0){
                itm_elem.y = 0;
            } else if(k == 1){
                itm_elem.y = top_1;
            } else if(k > 1){
                itm_elem.y = this.sq_arr_right[k-1].elem.y - top_2;
            }
            text.w = win_wid;
            text.h = win_wid;

            text.style.bottom = Math.round(-wid_elem*0.21) + 'px';
            text.style.right = Math.round(-wid_elem*0.21) + 'px';
            itm_elem.rotation = -45;

            if(page.type == 'video') {
                var scale = text.w/content.height;
                content.scaleX = content.scaleY = scale;
            }
            console.log(page)

        }
    },

    hide: function(){  
        this.cont_rhom_right.visible = false;
        this.cont_rhom_left.visible =  false;
    },

    show: function(mobile){  
        this.cont_rhom_right.visible = true;
        this.anim_show(this.sq_arr_right, mobile);

        if(!mobile){
            this.cont_rhom_left.visible = true;
            this.anim_show(this.sq_arr_left);    
        }

        
    },

    anim_show: function(sq_arr, mobile){
    	var delay = this.delay;
        var self = this;
        var num = !mobile ? 0.3 : 0.7;

        for (var i = 0; i < sq_arr.length; i++){

            var rhom_before = sq_arr[i].elem.rhom_before;
            var rhom_after = sq_arr[i].elem.rhom_after;
            var content = sq_arr[i].elem.content;
            if(sq_arr[i].type == 'image'){
                content.src = sq_arr[i].src;    
            } else if(sq_arr[i].type == 'video'){
                // content.src = sq_arr[i].src
            }
            

            rhom_before.scaleX = 0;
            rhom_before.scaleY = 0;

            rhom_after.scaleX = 0;
            rhom_after.scaleY = 0;

            TweenLite.to(rhom_before, delay, {scaleX: 1 , scaleY: 1 , delay: num*i});
            content.onload = (function(rhom, delay, inxex){
                TweenLite.to(rhom, delay, {scaleX: 1 , scaleY: 1 , delay: num*inxex+(delay*0.5)});
            })(rhom_after, delay, i)
        };
    }
}
