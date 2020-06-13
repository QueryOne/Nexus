pm = (function() {
  var prefix = '<span color="rgba(44,44,44,1)">(<span color="rgba(155,177,177,1)">pm</span>)</span>'
  var defaultColor = 'rgba( 231, 144, 33, 1 )'
  
  var report = function(msg) { ow_Write('#main', prefix + '<span color="' + defaultColor + '">' + msg + '</span>') }
  
  var defaults = [
    
  ]
  var packages = []

  var initialise = function() {
    report('Initialising Package Manager.')
    // Locate saved variables
    report('- Locating saved variables.')
    
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
