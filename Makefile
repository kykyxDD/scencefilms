extract=":JOIN /anchor/ { s/.*<!-- start of common.js -->\(.*\)<!-- end of common.js -->/\\1/; t TRIM; N; b JOIN; :TRIM; s/<script//gm; s/<\/script>//gm; s/src='//gm; s/'>//gm; p }"
scripts=$(shell sed -n "$(shell echo $(extract) | sed 's/anchor/<!-- start of common.js -->/')" index.html)

build: copy_files build/index.html build/data.json build/css/screen.css build/common.js

copy_files: $(shell find image/ -type f)
	mkdir build -p
	mkdir build/fonts -p
	cp fonts/*.* build/fonts
	mkdir build/image -p
	cp image/*.* build/image/
	mkdir build/image/img -p
	cp image/img/*.* build/image/img
	mkdir build/image/bg -p
	cp image/bg/*.* build/image/bg

build/index.html: index.html
	cp $^ $@
	sed -i ':JOIN /<!-- start of common.js -->/ { s:<!-- start of common.js -->.*<!-- end of common.js -->:<script src="common.js"></script>:; t END; N; b JOIN }; :END' $@

build/data.json: data.json
	cp $^ $@

build/css/screen.css:
	mkdir build/css -p
	cp css/screen.css $@

build/common.js: $(scripts)
	uglifyjs $^ --output $@

.PHONY: build copy
