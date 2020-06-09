(function() {
  var nexusInterface = 'Live-logs';
  /* This really shouldn't happen, as you invoke the download from "Live-logs" */
  if (client.package_exists(nexusInterface) == 0) { client.package_create(nexusInterface) }
  
  var package = client.get_package(nexusInterface);
  var init = client.reflex_create(package, 'init', 'alias');
      init.text = '-L([ ]+(.*))*$';
      init.matching = 'regex';
      init.actions = [
      
      ];
      
  client.gmcp_save_system(true);  
})()
