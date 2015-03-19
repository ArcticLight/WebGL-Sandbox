window.Sim = {
  pendingYavaAlert: null,
  pendingGLfragAlert: null,
  pendingGLvertAlert: null,
  actualYavaAlert: null,
  actualGLfragAlert: null,
  actualGLvertAlert: null,
  lastYavaScript: null,
  lastGLfragScript: null,
  lastGLvertScript: null,
  drawContext: null,
  vertexShader: false,
  compiledVertex: null,
  fragmentShader: false,
  compiledFragment: null,
  fullShader: false,
  compiledFullShader: null
};

window.loop = function(a,b,c) {};
window.frameCount = 1;
window.feedbackTime = 1000;

function mainFunction() {
  window.yavasrc = CodeMirror.fromTextArea(document.getElementById("yava-src"), {mode: 'javascript', lineNumbers: true});
  window.glfragsrc = CodeMirror.fromTextArea(document.getElementById("GLfrag-src"), {lineNumbers: true});
  window.glvertsrc = CodeMirror.fromTextArea(document.getElementById("GLvert-src"), {lineNumbers: true});

  var xvalidator = function(e){
    return e.metaKey || // cmd/ctrl
      (e.which >= 37 && e.which <= 40) || // arrow keys
      (e.which == 8) || // delete key
      /[0-9]/.test(String.fromCharCode(e.which)); // numbers
  };

  var wvalidator = function(z) {
    var val = $(z.currentTarget).val();
    if(!isNaN(val) && parseInt(val) >= z.currentTarget.min) {
      $(z.currentTarget).css('background-color', '');
      $("#result").css(z.data, val+"px");
    } else {
      $(z.currentTarget).css('background-color', '#F59F9F');
      z.preventDefault();
      return false;
    }
  };

  $("#width").on('input', null, "width", wvalidator);
  $("#width").on('keydown', xvalidator);

  $("#height").on('input', null, "height", wvalidator);
  $("#height").on('keydown', xvalidator);

  $("#border").on('change', function(e) {
    if(e.currentTarget.checked) {
      $("#result").css({"border": "1px solid black", "margin": "0"});
    } else {
      $("#result").css({'border': "none", "margin": "1px"});
    }
  });

  window.Sim.drawContext = initWebGL(document.getElementById("result"));

  if(!window.Sim.drawContext) {
    setPendingYavaAlert("Unable to init WebGL. This page won't work in your browser.");
  } else {
    window.requestAnimationFrame(update);
  }
}

function update(utime) {
  if(updateShader()) {
    $("#yava-shade").css('display', 'none');
    updateYavascript(utime);
  } else {
    $("#yava-shade").css('display', 'block');
  }

  window.requestAnimationFrame(update);
}

function initWebGL(canvas) {
  var gl = null;

  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch(e) {
  }

  return gl;
}

window.MyError;

function updateShader() {
  //First, the vertex shader
  var estr = window.glvertsrc.doc.getValue();
  var modified = (estr !== window.Sim.lastGLvertScript);
  var fstr = window.glfragsrc.doc.getValue();
  var fragmod = (estr !== window.Sim.lastGLfragScript);
  modified = modified || fragmod

  if(modified) {
    var gl = window.Sim.drawContext;
    try {
      var vshade = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vshade, estr);
      gl.compileShader(vshade);
      if(!gl.getShaderParameter(vshade, gl.COMPILE_STATUS)) {
        throw(gl.getShaderInfoLog(vshade));
      }
      if(window.Sim.actualGLvertAlert !== null) {
        $(window.Sim.actualGLvertAlert).alert('close');
        window.Sim.actualGLvertAlert = null;
      }
      if(window.Sim.pendingGLvertAlert !== null) {
        window.clearTimeout(window.Sim.pendingGLvertAlert);
        window.Sim.pendingGLvertAlert = null;
      }
      $('#GLvert-container').css('border', 'none');
      window.Sim.vertexShader = true;
      window.Sim.compiledVertex = vshade;
    } catch(e) {
      $('#GLvert-container').css('border', '1px solid red');
      setPendingGLvertAlert(e.toString());
      window.Sim.vertexShader = false;
      window.Sim.compiledVertex = null;
    }
  }

  window.Sim.lastGLvertScript = estr;

  //Next, the fragment shader.
  estr = fstr;
  if(modified) {
    try {
      var fshade = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fshade, estr);
      gl.compileShader(fshade);
      if(!gl.getShaderParameter(fshade, gl.COMPILE_STATUS)) {
        throw(gl.getShaderInfoLog(fshade));
      }
      if(window.Sim.actualGLfragAlert !== null) {
        window.clearTimeout(window.Sim.pendingGLfragAlert);
        window.Sim.pendingGLfragAlert = null;
      }
      $('#GLfrag-container').css('border', 'none');
      window.Sim.fragmentShader = true;
      window.Sim.compiledFragment = fshade;
    } catch(e) {
      $('#GLfrag-container').css('border', '1px solid red');
      setPendingGLfragAlert(e.toString());
      window.Sim.fragmentShader = false;
      window.Sim.compiledFragment = null;
    }
  }

  window.Sim.lastGLfragScript = estr;

  //link shaders
  if(modified) {
    var shader = gl.createProgram();
    try {
      gl.attachShader(shader,window.Sim.compiledVertex);
      gl.attachShader(shader,window.Sim.compiledFragment);
      gl.linkProgram(shader);
      if(!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
        var error = gl.getProgramInfoLog(shader);
        gl.deleteProgram(shader);
        throw(error);
      }
      gl.useProgram(shader);
      window.Sim.compiledFullShader = shader;
      window.Sim.fullShader = true;
    } catch(e) {
      window.Sim.compiledFullShader = null;
      window.Sim.fullShader = false;
      /*Attach the alert to the thing which was last modified.*/
      if(modified) {
        $('#GLvert-container').css('border', '1px solid red');
        setPendingGLvertAlert(e.toString());
      } else {
        $('#GLfrag-container').css('border', '1px solid red');
        setPendingGLfragAlert(e.toString());
      }
    }
  }

  return window.Sim.vertexShader && window.Sim.fragmentShader && window.Sim.fullShader;
}

function updateYavascript(utime) {
  var estr = "window.loop = function(gl, worldTime, frameCount) {\n" + window.yavasrc.doc.getValue() + "\n};";
  var modified = (estr !== window.Sim.lastYavaScript);
  var canvas = document.getElementById("result");

  window.frameCount++;

  if(modified) {
    window.frameCount = 1;
    try {
      eval(estr);
      window.Sim.drawContext.viewport(0, 0, canvas.width, canvas.height);
      window.loop(window.Sim.drawContext, utime, window.frameCount);
      if(window.Sim.actualYavaAlert !== null) {
        $(window.Sim.actualYavaAlert).alert('close');
        window.Sim.actualYavaAlert = null;
      }
      if(window.Sim.pendingYavaAlert !== null) {
        window.clearTimeout(window.Sim.pendingYavaAlert);
        window.Sim.pendingYavaAlert = null;
      }
      $('#yava-container').css('border', 'none');
    } catch (e) {
      $('#yava-container').css('border', '1px solid red');
      if(modified) {
        window.MyError = e;
        setPendingYavaAlert(e.toString());
      }
    }
  } else {
    try {
      window.loop(window.Sim.drawContext, utime, window.frameCount);
    } catch (e) {
      $('#yava-container').css('border', '1px solid red');
      if(modified) {
        setPendingYavaAlert(e.toString());
      }
    }
  }

  window.Sim.lastYavaScript = estr;
}

function setPendingYavaAlert(str) {
  if(window.Sim.pendingYavaAlert !== null) {
    window.clearTimeout(window.Sim.pendingYavaAlert);
  }
  window.Sim.pendingYavaAlert = window.setTimeout((function() {
    if(window.Sim.actualYavaAlert !== null) {
      $(window.Sim.actualYavaAlert).alert('close');
    }
    window.Sim.actualYavaAlert = makeErrorAlert(this.data);
    $("#yava-anchor").after(window.Sim.actualYavaAlert);
    window.Sim.pendingYavaAlert = null;
  }).bind({data: str}), feedbackTime);
}

function setPendingGLvertAlert(str) {
  if(window.Sim.pendingGLvertAlert !== null) {
    window.clearTimeout(window.Sim.pendingGLvertAlert);
  }
  window.Sim.pendingGLvertAlert = window.setTimeout((function() {
    if(window.Sim.actualGLvertAlert !== null) {
      $(window.Sim.actualGLvertAlert).alert('close');
    }
    window.Sim.actualGLvertAlert = makeErrorAlert(this.data);
    $("#GLvert-anchor").after(window.Sim.actualGLvertAlert);
    window.Sim.pendingGLvertAlert = null;
  }).bind({data: str}), feedbackTime);
}

function setPendingGLfragAlert(str) {
  if(window.Sim.pendingGLfragAlert !== null) {
    window.clearTimeout(window.Sim.pendingGLfragAlert);
  }
  window.Sim.pendingGLfragAlert = window.setTimeout((function() {
    if(window.Sim.actualGLfragAlert !== null) {
      $(window.Sim.actualGLfragAlert).alert('close');
    }
    window.Sim.actualGLfragAlert = makeErrorAlert(this.data);
    $("#GLfrag-anchor").after(window.Sim.actualGLfragAlert);
    window.Sim.pendingGLfragAlert = null;
  }).bind({data: str}), feedbackTime);
}

function makeErrorAlert(str) {
  var d = document.createElement("div");
  var m = document.createElement("strong");
  m.appendChild(document.createTextNode("Error!"));
  var b = document.createElement('button');
  b.type = "button";
  b.className = "close"
  b.dataset.dismiss = "alert";
  b.appendChild(document.createTextNode(String.fromCharCode(215)));
  d.appendChild(b);
  d.appendChild(m);
  d.appendChild(document.createTextNode(String.fromCharCode(160) + str));
  d.className = "alert alert-danger alert-dismissible";
  return d;
}
