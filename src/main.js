window.Sim = {
  pendingYavaAlert: null,
  pendingGLSLAlert: null,
  actualYavaAlert: null,
  actualGLSLAlert: null,
  lastYavaScript: null,
  lastGLSLScript: null
};

function main() {
  window.yavasrc = CodeMirror.fromTextArea(document.getElementById("yava-src"), {mode: 'javascript', lineNumbers: true});
  window.glslsrc = CodeMirror.fromTextArea(document.getElementById("GLSL-src"), {lineNumbers: true});

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

  window.requestAnimationFrame(update);
}

function update(utime) {
  var estr = "(function() {\n" + window.yavasrc.doc.getValue() + "\n})();";
  var modified = (estr !== window.Sim.lastYavaScript);
  try {
    eval(estr);
    if(window.Sim.actualYavaAlert !== null) {
      $(window.Sim.actualYavaAlert).alert('close');
    }
    if(window.Sim.pendingYavaAlert !== null) {
      window.clearTimeout(window.Sim.pendingyavaAlert);
      window.Sim.pendingYavaAlert = null;
    }
    $('#yava-container').css('border', 'none');
  } catch (e) {
    $('#yava-container').css('border', '1px solid red');
    if(modified) {
      setPendingYavaAlert(e.toString());
    }
  }
  window.Sim.lastYavaScript = estr;

  window.requestAnimationFrame(update);
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
  }).bind({data: str}),2000);
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
