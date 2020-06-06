

var packageID;

var n = client.package_exists('Live-Logs')
if (n == 0) {
  n = client.package_create('Live-Logs','Log directly onto Github.');
}
packageID = n;

ng = (function() {
  var random = function(min,max) { return Math.floor(Math.random() * (max - min + 1) + min) }
  var grandom = function(list) { return list[random(0, list.length - 1)] }
  
  var firstName = [
     'adorable','agreeable','amazing','ancient','artistic',
     'belligerent','brainy',
     'capricious','chemical','competitive','confused',
     'dainty','dangerous','daring','delightful',
     'earthy','envious',
     'fanciful','flatulent',
     'genius','glamorous','gleeful','groovy',
     'handsome','heady','hilarious','hypnotic',
     'incredible','inexpensive','inquisitive','intelligent',
     'jazzy','juicy',
     'keen','kind',
     'lamentable','lonely','luxuriant',
     'macabre','macho','majestic','marvelous','musical','mysterious',
     'necessary','needy','nonstop',
     'opulent','overconfident',
     'pastoral','penitent','purposeful',
     'quaint',
     'reckless','rich',
     'scientific','sonorous','soporific',
     'tantalising','tepid','treacherous',
     'uptight',
     'vain',
     'winsome',
  ]
  var lastName = [
     'antelope','armadillo','axolotl',
     'banana','bat','bee',
     'capybara','cat','cuttlefish',
     'dodo','dolphin','dotterel',
     'echidna','elephant',
     'fox',
     'giraffe','gnu','goldfish','gorilla','grouse',
     'hamster','herring','hyena',
     'ibex','impala',
     'jaguar', 
     'kouprey',
     'lemur','llama',
     'meerkat',
     'narwhal',
     'ocelot','osprey',
     'penguin','pika','porpoise',
     'quokka',
     'raccoon','raven','reindeer',
     'scorpion','serval','shark','sheep','stallion',
     'toucan',
     'walrus','weasel','wombat',
     'zebra',
  ]
  
  return {
    name: function() { return grandom(firstName) + '-' + grandom(lastName) },   
  }
})()

LE = (function() {
  var _salt = 'live-logs-salt-encrypted'
  var _token = 'live-logs-token-encrypted' /* Make sure this is the same as the other */
  var _iv = 'live-logs-iv-encrypted'
  
  var testLocalStorage = function() { if (typeof localStorage === 'undefined') {return false}; var t = 'test'; try {localStorage.setItem(t,t); localStorage.removeItem(t); return true;} catch(e) {return false} };

  var encrypt = async function(password, datum) {
    if (!testLocalStorage()) { client.print('>> Error: localStorage not available while encrypting.'); return }
      
    var f = function(pwd) { let enc = new TextEncoder(); return window.crypto.subtle.importKey('raw', enc.encode(pwd), {name: 'PBKDF2'}, false, ['deriveBits','deriveKey']); };
    var g = function(km, salt) { return window.crypto.subtle.deriveKey({name:'PBKDF2', salt:salt, iterations:100000, hash:'SHA-256'}, km, {name:'AES-GCM', length:256}, true, ['encrypt','decrypt']) };
    var h = function(datum) { let enc = new TextEncoder(); return enc.encode(datum) };
      
    let km = await f(password);
    salt = window.crypto.getRandomValues(new Uint8Array(16));
    let key = await g(km, salt);
    iv = window.crypto.getRandomValues(new Uint8Array(12));
    let encoded = h(datum);
    
    ciphertext = await window.crypto.subtle.encrypt({name: 'AES-GCM', iv: iv}, key, encoded);
      
    var c = new Uint8Array(ciphertext);
    var a = []; for (var i = 0; i < c.length; i++) { a.push(c[i]) };
    localStorage.setItem(_token, JSON.stringify(a));
    
    var a = []; for (var i = 0; i < salt.length; i++) { a.push(salt[i]) };
    localStorage.setItem(_salt, JSON.stringify(a));
    
    var a = []; for (var i = 0; i < iv.length; i++) { a.push(iv[i]) };
    localStorage.setItem(_iv, JSON.stringify(a));
      
    return true
  }
  
  var decrypt = async function(password, cipher) {
    if (!testLocalStorage()) { client.print('>> Error: localStorage not available while decrypting.'); return }
      
    var f = function(pwd) { let enc = new TextEncoder(); return window.crypto.subtle.importKey('raw', enc.encode(pwd), {name: 'PBKDF2'}, false, ['deriveBits','deriveKey']); };
    var g = function(km, salt) { return window.crypto.subtle.deriveKey({name:'PBKDF2', salt:salt, iterations:100000, hash:'SHA-256'}, km, {name:'AES-GCM', length:256}, true, ['encrypt','decrypt']) };
      
    var s = localStorage.getItem(_salt);
        s = JSON.parse(s);
        s = new Uint8Array(s);
    var v = localStorage.getItem(_iv);
        v = JSON.parse(v);
        v = new Uint8Array(v);
    let km = await f(password);
    let key = await g(km, s);
    try {
      let decrypted = await window.crypto.subtle.decrypt({name: 'AES-GCM', iv: v, }, key, cipher);
      let dec = new TextDecoder();
      var a = dec.decode(decrypted);
      return a ? a : false
    } catch(e) {
      client.print(' >> Decryption error.')   
      console.log(e)
      return false
    }
  }
  
  return {
    encrypt: encrypt,
    decrypt: decrypt,
  }
})()

LL = (function() {
  var useGZIP = true
  var repositoryAddress = 'live-logs-recorded'
  var encryptedTokenKey = 'live-logs-token-encrypted'
  
  // overwrite ws.onmessage's version of client.read_data
  if (client) {
   client.display_text_block = function(lines) {
     var block = client.generate_text_block(lines);
     client.update_text_completion(lines);
     if (block.length) ow_Write("#output_main", block);
   }
    
   client.generate_text_block = function(lines) {
     var out = {lines: [], printed: [], date: new Date().getTime()};
     var count = 0;

     var timestamp;
     if (client.show_timestamp_milliseconds === true)
         timestamp = client.getTimeMS();
     else
         timestamp = client.getTimeNoMS();
     var cl = "timestamp mono no_out";
     timestamp = "<span class=\"" + cl + "\">" + timestamp + "&nbsp;</span>";
       
     var res = '';

     var counter = 0;
     for (var i = 0; i < lines.length; ++i) {
       var txt = lines[i].parsed_line;
       var font = lines[i].monospace ? 'mono' : '';
       var line = "<div class=\"" + font + "\">" + timestamp + (txt ? txt.formatted() : '') + "</div>";

       // we want gagged lines to be logged, too
       if (logging && txt) append_to_log(line);

       if (lines[i].gag) continue;
       counter++;

       if (txt) {
           count++;
           res += line;
           out.lines.push(lines[i].parsed_line.text());
           out.printed.push(line);
       }
       var pr = lines[i].parsed_prompt;
       if (pr && (count > 0)) {   // no prompt if we gagged everything
           var g = "<div class=\"prompt " + font + "\">" + timestamp + pr.formatted() + "</div>";
           res += g;
           out.lines.push(lines[i].parsed_prompt.text());
           out.printed.push(g);
       }
       // empty line - include it if it's neither the first nor the last one
       // using "counter" instead of "i" fixes problems where the empty line is included after channel markers and such
       if ((!pr) && (!txt) && (counter > 1) && (i < lines.length - 1)) {
           var g = '<div line>' + timestamp + '&nbsp;' + '</div>';
           res += g;
           out.lines.push('')
           out.printed.push(g);
       }
     }
     if (client.extra_break && res.length) res += "<br />";
     if (typeof LL != 'undefined') { LL.log.push(out) };
     return res;
   }
   
  } // end client
    
  var lpad = function(str, len, ch) { if (typeof str == 'number') { str = str.toString() }; if (ch == null) { ch = ' ' }; var r = len - str.length; if (r < 0) { r = 0 }; return ch.repeat(r) + str };
  var testLocalStorage = function() { if (typeof localStorage === 'undefined') {return false}; var t = 'test'; try {localStorage.setItem(t,t); localStorage.removeItem(t); return true;} catch(e) {return false} };
  
  var verifyToken = function(token) {
    return $.ajax({
      url: 'https://api.github.com/user',
      type: 'GET',
      beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'token ' + token) },
      success: function(e) { LL.login = e.login; return e },
      error: function(e,f,g) { console.log('Error at Token not associated with Github account.'); console.log(e); console.log(f); console.log(g); client.print('>> Error: Token not associated with Github account.'); },
    })
  }
  
  var locateRepository = function(token, r, msg) {
    var login = r.login
    return $.ajax({
      url: 'https://api.github.com/repos/' + login + '/' + repositoryAddress,
      type: 'GET',
      beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'token ' + token) },
      success: function(e,f,g) {console.log(e); console.log(f); console.log(g)},
      error: function(e,f,g) {
        console.log('Error locating repository at path: https://api.github.com/repos/' + login + '/' + repositoryAddress);
        console.log(e); console.log(f); console.log(g);
        client.print('>> Error: Cannot locate repository at path: https://api.github.com/repos/' + login + '/' + repositoryAddress);
        console.log('Dropping initial Promise(), creating respository.');
        client.print('>> Dropping initial Promise()')
        client.print('>> Attempting to create repository at path: https://api.github.com/repos/' + login + '/' + repositoryAddress);
        createRepository(token, r, msg)
      },
    })
  }
  
  var createRepository = function(token, r, msg) {
    $.ajax({
      url: 'https://api.github.com/user/repos',
      type: 'POST',
      beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'token ' + token); },
      data: JSON.stringify({name: repositoryAddress, description:'repository for my live-logs', private: false}),
      success: function(e,f) { console.log(e); console.log(f); /* console.log(token); console.log(r); */ client.print('>> Successfully created repository. Writing...'); writeToRepository(token, r, msg); },
      error: function(e,f,g) { console.log('Error creating repository.'); console.log(e); console.log(f); console.log(g); client.print('>> Error: Unable to create repository, see console for more information.'); },
    })
  }
  
  var writeToRepository = function(token, r, msg) {
    var login = r.login || r.owner.login; // bleugh
    var datum = JSON.stringify(LL.log);
    if (useGZIP && typeof gzip != 'undefined') { datum = gzip.zip(datum) };
    var log = btoa(unescape(encodeURIComponent(datum))); // https://stackoverflow.com/a/45844934
    var date = new Date()
    var name = date.getFullYear() + '.' + lpad((date.getUTCMonth() + 1), 2, '0') + '.' + lpad(date.getUTCDate(), 2, '0') + 'H' + lpad(date.getUTCHours(), 2, '0') + '.' + lpad(date.getUTCMinutes(), 2, '0') + '.' + lpad(date.getUTCSeconds(), 2, '0') + '-' + ng.name()
    
    return $.ajax({
      url: 'https://api.github.com/repos/' + login + '/' + repositoryAddress + '/contents/' + name,
      type: 'PUT',
      beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'token ' + token); },
      data: JSON.stringify({message:'Uploaded log @ [' + new Date() + '] ' + msg, content: log}),
      success: function(e,f) {
         console.log(e); console.log(f); // client.print('Successfully written to Github.');
         client.print('>> Successfully written to Github. Read your new log here: ' + e.content.url);
         LL.log = [];
      },
      error: function(e,f,g) { 
         console.log('Error uploading data. Check that a SHA is not required, that Base64 encoding is correct and the path is correct. Good luck!'); 
         console.log(e); console.log(f); console.log(g);
         client.print('>> Error: Cannot upload data, check SHA, Base64 and path. Good luck.')
      },
    })
  }
  
  var attemptUpload = async function(msg) {
    /* Need to figure out Conditional Requests to reduce API Limit consumption (https://developer.github.com/v3/#schema) */
    let token;
    var msg   = msg || ''
    
    client.print('>> Beginning log attempt to Github.')
    if (!testLocalStorage()) {
      client.print('>> Unable to access localStorage, please input your Github token.');
      token = window.prompt('Enter your Github token.');
    } else {
      var password = window.prompt('Enter your local password.');
      var cipher = new Uint8Array(JSON.parse(localStorage.getItem(encryptedTokenKey)));
      token = await LE.decrypt(password, cipher);
      client.print('>> Token decrypted.');
    }
    verifyToken(token).then(res => locateRepository(token, res, msg)).then(res => writeToRepository(token, res, msg)); // we abandon the chain as writing has separate branches :(
  }
  
  var inputToken = function() {
    let token = window.prompt('Enter your Github token.');
    let password = window.prompt('Enter your local password.');
    var h = LE.encrypt(password, token);
    if (h) { client.print('>> Token encrypted.') };
  }
  
  var setup = async function() {
    await $.ajax({
      // url: 'https://cdn.jsdelivr.net/npm/gzip-js@0.3.2/lib/gzip.min.js',
      url: 'https://raw.githubusercontent.com/QueryOne/xu/master/gzip.min.js',
      success: function(e,v) {
        if (v == 'success') { try { eval(e) } catch(err) { console.log(err) } };
      },
    })
    if (!testLocalStorage()) {
      client.print('>> Browser not supporting localStorage, apologies. You will be required to input your token on attempting upload of logs.')
    } else {
      var encryptedToken = localStorage.getItem(encryptedTokenKey)
      if (encryptedToken === null) {
        inputToken()
      } else {
        client.print('>> Encrypted Github token found. Use your password when uploading logs to Github.');
      }
    }
  }
  client.print('>> Run LL.setup() when you are ready to setup. Run LL.upload() when you want to upload.')
    
  return {
    inputToken: inputToken,
    log: [],
    setup: setup,
    upload: attemptUpload,
  }
 })()
