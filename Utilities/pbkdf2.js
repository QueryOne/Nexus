PBKDF2 = (function() {
  var _salt  = 'PBKDF2-salt-encrypted'
  var _datum = 'PBKDF2-token-encrypted'
  var _iv    = 'PBKDF2-iv-encrypted'
  
  var testLocalStorage = function() { if (typeof localStorage === 'undefined') {return false}; var t = 'test'; try {localStorage.setItem(t,t); localStorage.removeItem(t); return true;} catch(e) {return false} };

  var encrypt = async function(password, datum) {
    if (!testLocalStorage()) { $('body').trigger('error-PBKDF2-1'); return }
      
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
    localStorage.setItem(_datum, JSON.stringify(a));
    
    var a = []; for (var i = 0; i < salt.length; i++) { a.push(salt[i]) };
    localStorage.setItem(_salt, JSON.stringify(a));
    
    var a = []; for (var i = 0; i < iv.length; i++) { a.push(iv[i]) };
    localStorage.setItem(_iv, JSON.stringify(a));
      
    return true
  }
  
  var decrypt = async function(password, cipher) {
    if (!testLocalStorage()) { $('body').trigger('error-PBKDF2-2'); return }
      
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
      $('body').trigger('error-PBKDF2-3');
      console.log(e)
      return false
    }
  }
  
  assign = function(datum, salt, iv) {
    _datum = datum
    _salt  = salt
    _iv    = iv
  }
  
  return {
    encrypt: encrypt,
    decrypt: decrypt,
    assign : assign,
  }
})()
