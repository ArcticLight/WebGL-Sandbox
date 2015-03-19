#WebGL Sandbox

Inspired by the workflow of [LightTable](http://lighttable.com/) and the idea of rapid-feedback prototyping, the WebGL Sandbox attempts
to be an online (or offline) environemnt in which you can write WebGL code, including shaders and animations in Javascript, and
debug them in realtime.

##How do I run this?

Simply pull or download this project, and double-click the index.html file inside the src/ directory. That's it!
Everything that happens on this HTML page happens inside your browser.

(Do note that eval() happens under-the-covers so that the Sandbox can be run offline as well as online, so don't paste
in code you don't trust!)

##What works?

Currently, instant evaluation of the given Javascript is working, as well as simple error reporting of that Javascript.

Instant evaluation of the given WebGL shaders is mostly working, but there are still a few important bugs that need to be
ironed out. Error reporting is very buggy for shaders at the moment, but they will (usually) evaluate correctly once you
have syntactically correct shaders in the boxes.

Work is ongoing to iron out these and plenty of other issues. Soon, the sandbox should be ready for prime-time!
