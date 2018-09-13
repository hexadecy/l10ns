define(function() {
function encodeHTMLSource() {  var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },  matchHTML = /&(?!#?w+;)|<|>|"|'|\//g;  return function() {    return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;  };};
String.prototype.encodeHTML=encodeHTMLSource();
var tmpl = {};
  tmpl['app']=function anonymous(it
/**/) {
var out='\n<div class="app" data-layout="app">\n  <header class="app-header">\n    <div class="app-left-header" data-region="leftHeader">\n      '+(it.leftHeader)+'\n    </div>\n    <div class="app-search" data-region="search">'+(it.search)+'</div>\n    <div class="app-locales" data-region="locales">'+(it.locales)+'</div>\n  </header>\n  <div class="app-localizations ';if(it.localization){out+='is-hidden';}out+='" ';if(it.localization){out+='style="display:none;"';}out+=' data-region="body">'+(it.body)+'</div>\n  <div class="app-localization ';if(!it.localization){out+='is-hidden';}out+='" ';if(!it.localization){out+='style="display:none;"';}out+=' data-region="localization">';if(it.localization){out+=(it.localization);}out+='</div>\n</div>\n';return out;
};
return tmpl;});
