extract=":JOIN /anchor/ { s/.*<!-- start of common.js -->\(.*\)<!-- end of common.js -->/\\1/; t TRIM; N; b JOIN; :TRIM; s/<script//gm; s/<\/script>//gm; s/src='//gm; s/'>//gm; p }"
scripts=$(shell sed -n "$(shell echo $(extract) | sed 's/anchor/<!-- start of common.js -->/')" index.html)

build: build/index.html build/css/screen.css build/common.js
	mkdir build -p

build/index.html:
	cp index.html $@
	sed -i ':JOIN /<!-- start of common.js -->/ { s:<!-- start of common.js -->.*<!-- end of common.js -->:<script src="common.js"></script>:; t END; N; b JOIN }; :END' $@

build/css/screen.css:
	cp css/screen.css $@

build/common.js: $(scripts)
	uglifyjs $^ --output $@

.PHONY: build
