function Anim_menu (argument) {

	var self = this;
	this.bg = document.querySelector('#bg');
	
	this.load = document.querySelector('#load');
	this.div_num_load = this.load.querySelector('.num_load');
	this.title_page = document.querySelector('#title_page');
	var style_title_page = ScreenObject.decorate_element.call(this.title_page);

	this.cont_menu = document.querySelector('#cont_menu');
	this.title_menu = this.cont_menu.querySelector('.title_menu');
	var title_menu_style = ScreenObject.decorate_element.call(this.title_menu);
	this.list_menu = this.cont_menu.querySelector('.list_menu');
	this.arr_list_items = this.list_menu.querySelectorAll('li');
	this.close_menu = this.list_menu.querySelector('.close_menu');
	this.addclass(this.cont_menu, 'vis_title');
	this.transition = new Transition(document.querySelector(".transition"));
	this.centerScreen();

	this.event_itm_menu();

	this.transition.show();

	for (var i = 0; i < this.arr_list_items.length; i++){
		var elem = this.arr_list_items[i];
		ScreenObject.decorate_element.call(elem)
	}
	
	this.title_menu.addEventListener('click', function(){
		self.hiddenTitleMenu();
		self.transition.expand();
	});
	this.close_menu.addEventListener('click', function(){
		self.hiddenListMenu();
		self.transition.collapse();
		
	})
	window.addEventListener('resize', function(){
		self.centerScreen();
	})
}
Anim_menu.prototype = {
	centerScreen: function(){
		var windowWidth = document.documentElement.clientWidth;
		var windowHeight = document.documentElement.clientHeight;
		this.load.style.top = Math.round(windowHeight/2) + 'px';
		this.load.style.left = Math.round(windowWidth/2) + 'px';
		this.transition.resize(windowWidth, windowHeight);
	},

	hiddenTitleMenu: function(){
		this.addclass(this.cont_menu, 'vis_menu');
		var self = this;
		setTimeout(function(){
			self.remclass(self.cont_menu, 'vis_title');
		},600)
	},
	hiddenListMenu: function(){
		this.remclass(this.cont_menu, 'vis_menu');
		var self = this;
		setTimeout(function(){
			self.addclass(self.cont_menu, 'vis_title');
		},100)
	},
	addclass: function(elem, name) {
		elem.className += ' '+ name
	},

	remclass: function(elem, name) {
		var r = elem.className.split(' ')
		for(var i = r.length -1; i >= 0; i--)
			if(r[i] === name) r.splice(i, 1)

		elem.className = r.join(' ')
	},

	hasclass: function(elem, name) {
		var r = elem.className.split(' ')
		for(var i = 0, l = r.length; i < l; i++)
			if(r[i] === name) return true
	},

	event_itm_menu: function(){
		var self = this;
		var itm_0 = this.arr_list_items[0]; 
		var itm_1 = this.arr_list_items[1]; 
		var itm_2 = this.arr_list_items[2]; 
		var itm_3 = this.arr_list_items[3]; 

		this.create_event(itm_0, 0);
		this.create_event(itm_1, 1);
		this.create_event(itm_2, 2);
		this.create_event(itm_3, 3);
	},

	create_event: function(elem, index){
		var self = this;
		elem.addEventListener('mouseover', function(e){
			self.addclass(elem, 'over');
			self.remclass(elem, 'out');
		})
		elem.addEventListener('mouseout', function(e){
			self.addclass(elem, 'out');
			self.remclass(elem, 'over');

			setTimeout(function(){
				self.remclass(elem, 'out');
			},600)
		})


		elem.addEventListener('click', function(e){	
			self.title_page.className = '';
			// self.title_page.y = elem.y+20;
			var target = e.target || e.srcElement;
			var text = target.textContent.toLowerCase();
			console.log(text)

			
			self.title_page.textContent = text;
			self.loadPages(text);

			self.transition.open();

		})
	},

	loadPages: function(text){
		this.remclass(this.cont_menu, 'vis_menu');
		var self = this;
		this.addclass(this.load,'visib');

		var num = 0;
		var max_num = 100;
		setTimeout(function(){
			self.bg.className = '';
			self.addclass(self.bg, text);
			self.addclass(self.title_page, text);
		},300)

		animation()

		function animation(){
			self.div_num_load.textContent = num;

			if(num < max_num){
				num+=1;
				requestAnimationFrame(animation)
			} else {
				self.transition.close();
				self.remclass(self.load,'visib');

				setTimeout(function(){
					// self.title_page.y = 20;
					// self.remclass(self.title_page, text);
					self.addclass(self.cont_menu, 'vis_title');
					self.transition.show();
				}, 2000);
			}
		}
	}
}
