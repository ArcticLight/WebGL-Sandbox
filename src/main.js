function main() {
  window.yavasrc = CodeMirror.fromTextArea(document.getElementById("yava-src"), {mode: 'javascript', lineNumbers: true});
  window.glslsrc = CodeMirror.fromTextArea(document.getElementById("GLSL-src"), {lineNumbers: true});

  $(':input,[type=number]').on('keydown', function(e){
    return e.metaKey || // cmd/ctrl
      (e.which >= 37 && e.which <= 40) || // arrow keys
      (e.which == 8) || // delete key
      /[0-9]/.test(String.fromCharCode(e.which)); // numbers
  })

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

  $("#height").on('input', null, "height", wvalidator);

  $("#border").on('change', function(e) {
    if(e.currentTarget.checked) {
      $("#result").css({"border": "1px solid black", "margin": "0"});
    } else {
      $("#result").css({'border': "none", "margin": "1px"});
    }
  });
}


window.watch
