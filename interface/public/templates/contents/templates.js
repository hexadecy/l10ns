define(function() {
function encodeHTMLSource() {  var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },  matchHTML = /&(?!#?w+;)|<|>|"|'|\//g;  return function() {    return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;  };};
String.prototype.encodeHTML=encodeHTMLSource();
var tmpl = {};
  tmpl['LeftMenu']=function anonymous(it
/**/) {
var out='\n<div class="left-menu" date-content="LeftMenu">\n  <ul class="left-menu-items">\n    <li class="left-menu-item">\n      <a class="left-menu-anchor left-menu-anchor-home">\n        <i class="left-menu-icon sp-default sp-default-home"></i>\n        <span class="left-menu-text left-menu-text-home">'+(it.homeTitle)+'</span>\n      </a>\n    </li>\n    <li class="left-menu-item">\n      <a class="left-menu-anchor left-menu-anchor-compile">\n        <i class="left-menu-icon sp-default sp-default-play"></i>\n        <span class="left-menu-text">'+(it.compileTitle)+'</span>\n      </a>\n    </li>\n  </ul>\n</div>\n';return out;
};
  tmpl['Locales']=function anonymous(it
/**/) {
var out='\n<div class="locales" data-content="locales">\n  <div class="locales-button">\n    <i class="locales-button-icon sp-default sp-default-globe"></i>\n    <span class="locales-button-text">'+(it.currentLocale)+'</span>\n  </div>\n  <div class="locales-dropdown">\n    <div class="locales-dropdown-caret">\n      <span class="caret-inner"></span>\n      <span class="caret-outer"></span>\n    </div>\n    <ul class="locales-list">\n      '; for(var locale in it.locales) { out+='\n        <li class="locale" data-locale="'+(locale)+'">\n          <a class="locale-anchor">'+(locale)+'</a>\n        </li>\n      '; } out+='\n    </ul>\n  </div>\n</div>\n';return out;
};
  tmpl['Localization']=function anonymous(it
/**/) {
var out='\n\n\n<div class="localization" data-content="localization">\n  <h1 class="localization-title">'+(it.key)+'</h1>\n  <div class="localization-variables">\n    <span class="localization-variables-label">'+(it.l10ns.variables)+'</span>\n    ';var arr1=it.variables;if(arr1){var variable,index=-1,l1=arr1.length-1;while(index<l1){variable=arr1[index+=1];out+='\n      <span class="localization-variable" data-value="'+(variable||'').toString().encodeHTML()+'">'+(variable||'').toString().encodeHTML()+'</span>\n    ';} } out+='\n  </div>\n  <div class="localization-input">\n    <ul class="localization-actions">\n      <li class="localization-action">\n        <a class="localization-action-anchor localization-action-select">select</a>\n      </li>\n      <li class="localization-action">\n        <a class="localization-action-anchor localization-action-plural">plural</a>\n      </li>\n      <li class="localization-action">\n        <a class="localization-action-anchor localization-action-selectordinal">selectordinal</a>\n      </li>\n      <li class="localization-action">\n        <a class="localization-action-anchor localization-action-number">number</a>\n      </li>\n      <li class="localization-action">\n        <a class="localization-action-anchor localization-action-currency">currency</a>\n      </li>\n      <li class="localization-action">\n        <a class="localization-action-anchor localization-action-date">date</a>\n      </li>\n    </ul>\n    <textarea class="localization-textarea localization-textarea-real">'+(it.value||'').toString().encodeHTML()+'</textarea>\n    <div class="localization-text-area-height-helper-container">\n      <textarea class="localization-textarea localization-textarea-mirror"></textarea>\n    </div>\n  </div>\n  <div class="localization-message">\n    <p class="localization-message-text">'+(it.message)+'</p>\n  </div>\n  <div class="localization-buttons is-revealed">\n    <a class="localization-save">'+(it.l10ns.save)+'</a>\n    <canvas class="localization-loading-canvas"></canvas>\n  </div>\n</div>\n';return out;
};
  tmpl['LocalizationItem']=function anonymous(it
/**/) {
var out='\n<tr class="localization" data-id="'+(it.id||'').toString().encodeHTML()+'" data-key="'+(it.key||'').toString().encodeHTML()+'">\n  <td class="localization-col localization-key">'+(it.keyText||'').toString().encodeHTML()+'</td>\n  <td class="localization-col localization-value">'+(it.value.replace('\n', '<br>')||'').toString().encodeHTML()+'</td>\n</tr>\n';return out;
};
  tmpl['Localizations']=function anonymous(it
/**/) {
var out='\n<table class="localizations" data-content="localizations">\n  <thead class="localizations-headers">\n    <tr>\n      <th class="localization-col localizations-header">'+(it.metas.l10n_keys)+'</th>\n      <th class="localization-col localizations-header">'+(it.metas.l10n_values)+'</th>\n    </tr>\n  </thead>\n  <tbody>\n    ';var arr1=it;if(arr1){var localization,index=-1,l1=arr1.length-1;while(index<l1){localization=arr1[index+=1];out+='\n      <tr class="localization" data-id="'+(localization.id||'').toString().encodeHTML()+'" data-key="'+(localization.key||'').toString().encodeHTML()+'">\n        <td class="localization-col localization-key">'+(localization.keyText)+'</td>\n        <td class="localization-col localization-value">'+(localization.value.replace('\n', '<br>')||'').toString().encodeHTML()+'</td>\n      </tr>\n    ';} } out+='\n    ';if(it.length === cf.ITEMS_PER_PAGE){out+='\n      <tr class="localization-load">\n        <td class="localization-load-cell">\n          <a class="localization-load-anchor">'+(it.metas.l10n_loadMore)+'</a>\n        </td>\n      </tr>\n    ';}out+='\n  </tbody>\n</table>\n<div class="__htmlEscape__" style="display: none;"></div>\n';return out;
};
  tmpl['Search']=function anonymous(it
/**/) {
var out='\n\n\n<div class="search-layout js-search" data-content="search">\n  <input class="search" type="text" placeholder="'+(it.i18n_placeholder)+'"></input>\n</div>\n';return out;
};
  tmpl['SearchResults']=function anonymous(it
/**/) {
var out='\n<div class="search-results">\n  <ul class="search-result-list">\n    ';var arr1=it;if(arr1){var result,index=-1,l1=arr1.length-1;while(index<l1){result=arr1[index+=1];out+='\n      <li class="search-result ';if(index === 0){out+='active';}out+='" data-index="'+(index)+'" data-key="'+(result.key||'').toString().encodeHTML()+'">\n        <h5 class="search-result-key">'+(result.key||'').toString().encodeHTML()+'</h5>\n        <h6 class="search-result-value">'+(result.value||'').toString().encodeHTML()+'</h6>\n      </li>\n    ';} } out+='\n  </ul>\n</div>\n';return out;
};
return tmpl;});
