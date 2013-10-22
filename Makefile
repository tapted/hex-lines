SRCDIR := .
#SRCS := $(shell cd $(SRCDIR) && ls *.js)
## SRCS ordered by dependency order
SRCS := hex.js grid.js orb.js board.js game.js path.js score.js \
    removeOrb.js anim.js level.js controlGame.js main.js

APPDIR := app
PROJECT := $(shell basename `pwd`)
STATIC_DEPS := $(shell find app -type f -not -name '.*')
GENERATED_DEPS := $(patsubst %,$(APPDIR)/%,$(SRCS))
APP_DEPS := $(STATIC_DEPS) # $(GENERATED_DEPS)

# compilation_level options: WHITESPACE_ONLY SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZATIONS
LINT := /usr/local/bin/gjslint
CLOSURE := java -jar compiler.jar
CLOSURE_ARGS := --warning_level VERBOSE \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --language_in ECMASCRIPT5_STRICT \
  --externs build/externs.js \
  --formatting=pretty_print \
  --summary_detail_level 3

CLOSURE_LINT_ARGS := --warning_level VERBOSE \
  --compilation_level WHITESPACE_ONLY \
  --language_in ECMASCRIPT5_STRICT

all : build/bundle.js $(PROJECT).zip

$(APPDIR)/%.js : $(SRCDIR)/%.js
	$(LINT) --unix_mode $<
	$(CLOSURE) $(CLOSURE_LINT_ARGS) --js $< --js_output_file $@ || (rm $@ && false)

build/bundle.js : compiler.jar $(SRCS) Makefile build/externs.js $(APPDIR)/Assets/Red.svg
	$(CLOSURE) $(CLOSURE_ARGS) $(patsubst %,--js %,$(SRCS)) --js_output_file $@ || (rm $@ && false)
	cp build/bundle.js $(APPDIR)

$(APPDIR)/Assets/Red.svg :
	./make_buttons.sh

$(APPDIR)/soy/%.js : soy/%.js
	$(CLOSURE) $(CLOSURE_ARGS) --js $< --js_output_file $@ || (rm $@ && false)

soy/%.js : $(SRCDIR)/%.soy
	java -jar SoyToJsSrcCompiler.jar --outputPathFormat $@ --srcs $< || (rm $@ && false)

clean:
	rm -f $(GENERATED_DEPS)

distclean: clean
	rm $(PROJECT).zip

.PHONY : test build clean

build : $(APP_DEPS)

test : build
	echo built

$(PROJECT).zip : $(APP_DEPS) $(SRCDIR)/window.js
	rm -f $(PROJECT).zip
	cp $(SRCDIR)/window.js $(APPDIR)
	cd $(APPDIR) && zip ../$(PROJECT).zip $(patsubst app/%,%,$(APP_DEPS))

compiler.jar :
	curl -O http://closure-compiler.googlecode.com/files/compiler-latest.zip
	unzip compiler-latest.zip compiler.jar
	rm compiler-latest.zip
