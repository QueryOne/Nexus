(function() {
  var script = `
console.log(args);
if (args[1] == 'undefined') {
  if (LL.checkToken()) {
    LL.upload()
  } else {
    LL.inputToken()
  }
} else {
  var t = args[1].split(' ');
  console.log(t);
}
`
  
  var nexusInterface = 'Live-logs';
  /* This really shouldn't happen, as you invoke the download from "Live-logs" */
  if (client.package_exists(nexusInterface) == 0) { client.package_create(nexusInterface) }
  
  var package = client.get_package(nexusInterface);
  var init = client.reflex_create(package, 'init', 'alias');
      init.text = '-L([ ]+(.*))*$';
      init.matching = 'regexp';
      init.actions = [
        {action:'script', script:script},
      ];
      
  client.gmcp_save_system(true);  
})()
