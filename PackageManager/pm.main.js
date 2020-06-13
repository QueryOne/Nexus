pm = (function() {
  // Options
  var prefix = '<span style="color:rgba(44,44,44,1);">(<span style="color:rgba(111,177,177,1);">pm</span>)</span>'
  var defaultColor = 'rgba( 177, 144, 53, 1 )'
  var pmKey = 'pmPackages'
  var pmOutput = 'output_main'
  var pmOutput2 = 'pm-main'
  
  // CSS
  var cssClass = 'pm-css'
  var cssRules = ''
      // Dimensions
      cssRules += '#pm-main {position:absolute; right:1.2em; top:-408px; height:250px; width:360px;}\n'
      // Styling
      cssRules += '#pm-main {border:1px solid rgba(88,14,14,0.33); border-radius:3px; background:rgba(22,19,17,1);'
      // Font
  
  var css = function() {
    $('.' + cssClass).remove() // clear previous &
    $('body').append('<div class="' + cssClass + '">&shy;<style>' + cssRules + '</style></div>') // inject
  }
  
  var swap = function() { [pmOutput, pmOutput2] = [pmOutput2, pmOutput] }
  var report = function(msg) { ow_Write('#' + pmOutput, prefix + '<span style="color:' + defaultColor + ';"> ' + msg + '</span>') }
  
  var defaults = [
    
  ]
  var packages = []
  
  var draw = function() {
    // 
    // Anchor this to #input
    var build  = ''
        build += '<div id="' + pmOutput2 + '"'
        build += '<div id="pm-closer">x</div>'
        build += '' + '</div>'
    $('#bottom').append(build)
  }
  
  var initialise = function() {
    report('Initialising Package Manager.')
    // Exit the #main_output flow
    css();
    draw();
    // swap();
    
    
    // Locate saved variables
    report('- Locating saved variables.')
    for (const [k, v] of Object.entries(client.vars)) {
      if (k == pmKey) {
        packages = v
        break
      }
    }
    
    // Evaluate list of packages
    report('- Evaluating package list.')
    
    // Download approved packages
    report('- Downloading approved packages.')
    
    // Provide interface
    report('- Beginning interface.')
    
    // Provide initialised prompt
    
  }

  return {
    initialise: initialise,
    packages  : packages,
    report    : report,
  }
})()
