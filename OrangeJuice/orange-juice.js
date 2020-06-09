orange = (function() {
  var patterns = {
    regex: /(<span|<\/span>)/g,
    head : /\<span.*?\>/,
    span : /\<\/span\>$/,
    color: /\xc-([\w\(\),\%\s]+)/,
  }

  var parse = function(str) {
    var out = []
    var str = str || ''
    var RE  = pattern.regex;
    var SP  = pattern.span;
    var CX  = pattern.color;
    var PR  = pattern.head;
    var matches; 
    while (matches = RE.exec(str)) { out.push(matches.index) }
    var cap = str.length
    var g = [];
 
    for (var i = out.length - 1; i > -1; i--) { 
      var n = out[i]
      g.unshift(str.substring(n, cap))
      cap = n
      if (i == 0 && out[i] != 0) { g.unshift(str.substring(0, out[i])) } // rescue the front of the line
    }
    // console.log(str); console.log(g)

    var cm     = []
    var chunks = []
    for (var i = 0; i < g.length; i++) {
      var el = g[i]
      if (el.match(SP)) {
        cm.pop()
        var c = cm[cm.length - 1] || 'reset'
        chunks.push( client.linechunk_color(c) )
      } else if (el.match('</span>')) {
        cm.pop()
        var c = cm[cm.length - 1] || 'reset'
        chunks.push( client.linechunk_color(c) )
        var e = el.replace('</span>','')
        chunks.push( client.linechunk_text(e) )
      } else if (el.match('<span ')) {
        var c = el.match(CX)
        if (c) {
        cm.push(c[1])
        chunks.push( client.linechunk_color(c[1]) ) }
        var e = el.replace(PR,'')
        chunks.push( client.linechunk_text(e) )
      } else {
        chunks.push( client.linechunk_text(el) )
      }
    }
    // console.log(chunks)
    return chunks
  }

  var express = function(str, vpos, hpos, overwrite) {
    var chunks = parse(str);
    var vpos = vpos || 0;
    var hpos = hpos || 1;
    var ow = overwrite || false;

    /* VPOS
       -2 : top of the block
       -1 : last displayed line
        0 : current line
        1 : next displayed line
        2 : prompt
     */
    var p = [];
    if (vpos == -2) {
      p = client.current_block[0].parsed_line || client.current_block[0].parsed_prompt;
    } else if (vpos == -1) {
      var idx = client.current_block.indexOf(client.current_line) - 1;
      if (idx < 0) { idx = 0 }
      for (var i = idx; i > -1; i--) {
        if (typeof client.current_block[i] != 'undefined' && client.current_block[i].gag != true) {
          p = client.current_block[i].parsed_line || client.current_block[i].parsed_prompt
          break
        }
      }
    } else if (vpos == 0) {
      if (client.current_line.parsed_line) {
       p = client.current_line.parsed_line
      } else if (client.current_line.parsed_prompt) {
       p = client.current_line.parsed_prompt   
      }
    } else if (vpos == 1) {
      var idx = client.current_block.indexOf(client.current_line) + 1
      if (idx > (client.current_block.length - 1)) { idx = client.current_block.indexOf(client.current_line) }
      for (var i = idx; i < client.current_block.length; i++) {
        if (typeof client.current_block[i] != 'undefined' && client.current_block[i].gag != true) {
          p = client.current_block[i].parsed_line || client.current_block[i].parsed_prompt
          break
        }
      }
    } else if (vpos == 2) {
      // usually the last line of the block
      p = client.current_block[(client.current_block.length - 1)].parsed_prompt || []
    }

    /* HPOS
       -2 : prefix & newline
       -1 : prefix
        0 : newline
        1 : suffix
        2 : suffix & newline
     */
    if (hpos == -2) {
      chunks.push( client.linechunk_text('\n') )
      p.chunks = chunks.concat(p.chunks)
    } else if (hpos == -1) {
      p.chunks = chunks.concat(p.chunks)
    } else if (hpos == 0) {
      chunks = [client.linechunk_text('\n')].concat(chunks)
      p.chunks = p.chunks.concat(chunks)  
    } else if (hpos == 1) {
      p.chunks = p.chunks.concat(chunks)
    } else if (hpos == 2) {
      chunks.unshift( client.linechunk_text('\r\n') )
      p.chunks = p.chunks.concat(chunks)
    }
  }

  return {
    print   : express,
    patterns: patterns,
  }
})();
