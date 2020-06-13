pm = (function() {
  // Options
  var save = function() { client.gmcp_save_system(true) }
  var prefix = '<span style="color:rgba(44,44,44,1);">(<span style="color:rgba(111,177,177,1);">pm</span>)</span>'
  var defaultColor = 'rgba( 177, 144, 53, 1 )'
  var pmKey = 'pmPackages'
  var pmOutput = 'output_main'
  var pmOutput2 = 'pm-main'
  
  // CSS
  var cssClass = 'pm-css'
  var cssRules = ''
      // Dimensions, Positioning
      cssRules += '#pm-main {position:absolute; right:11px; top:-258px; height:250px; width:360px;}\n'
      cssRules += '#pm-closer {position:absolute; right:2px; top:2px; height:17px; width:17px;}\n'
      cssRules += '#pm-header {position:absolute; left:0%; top:0%; height:18px; width:calc(100% - 17px - 2px);}\n'
      cssRules += '#pm-h-name, #pm-h-use, #pm-h-copy {display:inline-block; height:18px;}\n'
      cssRules += '#pm-h-name {position:absolute; left:0%; top:0%; width:205px;}\n'
      cssRules += '#pm-h-use {position:absolute; left:calc(0% + 190px); top:0%; width:60px;}\n'
      cssRules += '#pm-h-copy {position:absolute; left:calc(0% + 190px + 60px); top:0%; width:60px;}\n'
      cssRules += '#pm-body {position:absolute; left:0%; top:19px; height:calc(100% - 18px); width:100%;}\n'
      // Styling
      cssRules += '#pm-main {border:1px solid rgba(88,14,14,0.33); border-radius:3px; background:rgba(22,19,17,1); background:"raster.png";}\n'
      cssRules += '#pm-closer {cursor:pointer;}\n'
      cssRules += '#pm-header {border-bottom:1px solid rgba(88,14,14,0.33); background:rgba(44,44,44,0.78);}\n'
      cssRules += '#pm-body::-webkit-scrollbar {display:none;}\n'
      // Behaviour
      cssRules += '#pm-body {overflow-y:scroll;}\n'
      // Google Fonts
      cssRules += '@import url("https://fonts.googleapis.com/css2?family=Tenali+Ramakrishna&display=swap");\n'
      // Font
      cssRules += '#pm-closer {color:rgba(200,22,22,1); text-align:center; line-height:18px;}\n'
      cssRules += '#pm-closer:hover {color:rgba(255,22,22,1);}\n'
      cssRules += '#pm-h-name, #pm-h-use, #pm-h-copy {padding-left:0.3em; line-height:18px; color:rgba(77,77,77,1);}\n'
      cssRules += '#pm-h-name, #pm-h-use, #pm-h-copy {font-family:"Tenali Ramakrishna",sans-serif; font-size:9pt;}\n'
  
  var css = function() {
    $('.' + cssClass).remove() // clear previous &
    $('body').append('<div class="' + cssClass + '">&shy;<style>' + cssRules + '</style></div>') // inject
  }
  
  var swap = function() { [pmOutput, pmOutput2] = [pmOutput2, pmOutput] }
  var report = function(msg) { ow_Write('#' + pmOutput, prefix + '<span style="color:' + defaultColor + ';"> ' + msg + '</span>') }
  
  var defaults = [
    { url: 'https://google.com',
      id:'utilities',
      name:'Utilities',
      use:false,
      copy:true,
    },
    { url: 'https://google.com',
      id:'mapper',
      name:'Achaean Mapper',
      use:false,
      copy:false,
    },
  ]
  var packages = []
  
  var draw = function() {
    /*
    $.ajax({url: 'https://raw.githubusercontent.com/QueryOne/Nexus/master/PackageManager/raster.png',
            success: function(r) { console.log(r) },
            error: function(err) { console.log(err) }
           }) */
    
    // Anchor this to #input
    var build  = ''
        build += '<div id="' + pmOutput2 + '">'
        build += '<div id="pm-closer" onclick="pm.close()">x</div>'
        build += '<div id="pm-header">'
        build +=   '<div id="pm-h-name">Package Name</div>'
        build +=   '<div id="pm-h-use">Use</div>'
        build +=   '<div id="pm-h-copy">Copy</div>'
        build += '</div>'
        build += '<div id="pm-body"></div>'
        build += '' + '</div>'
    $('#' + pmOutput2).remove()
    $('#bottom').append(build)
    $('#' + pmOutput2).draggable({handle:'#pm-header'})
  }
  
  var initialise = function() {
    report('Initialising Package Manager.')
    // Exit the #main_output flow
    css();
    draw();
    // swap();
    
    // Locate saved variables
    //   for (const [k, v] of Object.entries(client.vars)) {
    report('- Locating saved variables.')
    if (!client.vars[pmKey]) {
      packages = defaults
      client.set_variable(pmKey, packages)
      report('-- set packages to defaults')
    } else {
      packages = client.vars[pmKey]
    }
    
    // Evaluate list of packages
    report('- Evaluating package list.')
    var str = ''
    packages.forEach(function(e,v) {
      console.log(e)
      console.log(v)
      str += '<div id="pm-package-' + e.name + '" class="pm-package-name">' + e.name + '</div>'
      str += '<div id="pm-package-' + e.name + '-use" class="pm-package-use">' + e.use + '</div>'
      str += '<div id="pm-package-' + e.name + '-copy" class="pm-package-copy">' + e.copy + '</div>'
      $('#pm-body').append('<div id="pm-package-' + e.name + '" class="pm-package-item">' + str + '</div>')
    })
    
    // Download approved packages
    report('- Downloading approved packages.')
    
    // Provide interface
    report('- Beginning interface.')
    
    // Provide initialised prompt
    
    // Save
    save()
  }
  
  var close = function() { $('#' + pmOutput2).remove() }
  var clearPackages = function() {
    packages = []
    client.delete_variable(pmKey)
    client.set_variable(pmKey, packages)
    report('- Cleared packages.')
  }

  initialise()
  return {
    initialise: initialise,
    packages  : packages,
    report    : report,
    close     : close,
    clearPackages : clearPackages,
  }
})()
