extract=":JOIN /anchor/ { s/.*\[\(.*\)\]/\\1/; t TRIM; N; b JOIN; :TRIM; s/^\s*'\|',\?$$//gm; p }"
scripts=$(shell sed -n "$(shell echo $(extract) | sed 's/anchor/scripts.html5/')" index.html)

build: build/index.html build/common.js

build/index.html: index.html
	cp index.html $@
	sed -i ':JOIN /scripts.html5/ { s/\[.*\]/["common.js"]/; t END; N; b JOIN }; :END' $@

build/common.js: $(scripts)
	uglifyjs $^ --compress --mangle --output $@ 
	# uglifyjs puts "use strict" to start of resulting file - make troubles
	sed -i 's/^"use strict";//' $@
	# and removes not used variables - IE gets bleeding on setter without arguments
	sed -i 's/\(set \w\+\)()/\1(_)/' $@


.PHONY: build
