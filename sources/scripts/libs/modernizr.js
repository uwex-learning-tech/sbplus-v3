/*! modernizr 3.5.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-csscalc-eventlistener-flexbox-flexwrap-json-localstorage-objectfit-sessionstorage-svg-video-setclasses-cssclassprefix:modernizr- !*/
!function(e,n,t){function r(e,n){return typeof e===n}function o(){var e,n,t,o,s,a,i;for(var l in S)if(S.hasOwnProperty(l)){if(e=[],n=S[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(o=r(n.fn,"function")?n.fn():n.fn,s=0;s<e.length;s++)a=e[s],i=a.split("."),1===i.length?Modernizr[i[0]]=o:(!Modernizr[i[0]]||Modernizr[i[0]]instanceof Boolean||(Modernizr[i[0]]=new Boolean(Modernizr[i[0]])),Modernizr[i[0]][i[1]]=o),w.push((o?"":"no-")+i.join("-"))}}function s(e){var n=C.className,t=Modernizr._config.classPrefix||"";if(T&&(n=n.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(r,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),T?C.className.baseVal=n:C.className=n)}function a(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):T?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function i(e){return e.replace(/([a-z])-([a-z])/g,function(e,n,t){return n+t.toUpperCase()}).replace(/^-/,"")}function l(e,n){return!!~(""+e).indexOf(n)}function c(e,n){return function(){return e.apply(n,arguments)}}function f(e,n,t){var o;for(var s in e)if(e[s]in n)return t===!1?e[s]:(o=n[e[s]],r(o,"function")?c(o,t||n):o);return!1}function u(e){return e.replace(/([A-Z])/g,function(e,n){return"-"+n.toLowerCase()}).replace(/^ms-/,"-ms-")}function d(n,t,r){var o;if("getComputedStyle"in e){o=getComputedStyle.call(e,n,t);var s=e.console;if(null!==o)r&&(o=o.getPropertyValue(r));else if(s){var a=s.error?"error":"log";s[a].call(s,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else o=!t&&n.currentStyle&&n.currentStyle[r];return o}function p(){var e=n.body;return e||(e=a(T?"svg":"body"),e.fake=!0),e}function v(e,t,r,o){var s,i,l,c,f="modernizr",u=a("div"),d=p();if(parseInt(r,10))for(;r--;)l=a("div"),l.id=o?o[r]:f+(r+1),u.appendChild(l);return s=a("style"),s.type="text/css",s.id="s"+f,(d.fake?d:u).appendChild(s),d.appendChild(u),s.styleSheet?s.styleSheet.cssText=e:s.appendChild(n.createTextNode(e)),u.id=f,d.fake&&(d.style.background="",d.style.overflow="hidden",c=C.style.overflow,C.style.overflow="hidden",C.appendChild(d)),i=t(u,e),d.fake?(d.parentNode.removeChild(d),C.style.overflow=c,C.offsetHeight):u.parentNode.removeChild(u),!!i}function m(n,r){var o=n.length;if("CSS"in e&&"supports"in e.CSS){for(;o--;)if(e.CSS.supports(u(n[o]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var s=[];o--;)s.push("("+u(n[o])+":"+r+")");return s=s.join(" or "),v("@supports ("+s+") { #modernizr { position: absolute; } }",function(e){return"absolute"==d(e,null,"position")})}return t}function y(e,n,o,s){function c(){u&&(delete j.style,delete j.modElem)}if(s=r(s,"undefined")?!1:s,!r(o,"undefined")){var f=m(e,o);if(!r(f,"undefined"))return f}for(var u,d,p,v,y,g=["modernizr","tspan","samp"];!j.style&&g.length;)u=!0,j.modElem=a(g.shift()),j.style=j.modElem.style;for(p=e.length,d=0;p>d;d++)if(v=e[d],y=j.style[v],l(v,"-")&&(v=i(v)),j.style[v]!==t){if(s||r(o,"undefined"))return c(),"pfx"==n?v:!0;try{j.style[v]=o}catch(h){}if(j.style[v]!=y)return c(),"pfx"==n?v:!0}return c(),!1}function g(e,n,t,o,s){var a=e.charAt(0).toUpperCase()+e.slice(1),i=(e+" "+E.join(a+" ")+a).split(" ");return r(n,"string")||r(n,"undefined")?y(i,n,o,s):(i=(e+" "+N.join(a+" ")+a).split(" "),f(i,n,t))}function h(e,n,r){return g(e,t,t,n,r)}var w=[],S=[],x={_version:"3.5.0",_config:{classPrefix:"modernizr-",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){S.push({name:e,fn:n,options:t})},addAsyncTest:function(e){S.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=x,Modernizr=new Modernizr,Modernizr.addTest("eventlistener","addEventListener"in e),Modernizr.addTest("json","JSON"in e&&"parse"in JSON&&"stringify"in JSON),Modernizr.addTest("svg",!!n.createElementNS&&!!n.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect),Modernizr.addTest("localstorage",function(){var e="modernizr";try{return localStorage.setItem(e,e),localStorage.removeItem(e),!0}catch(n){return!1}}),Modernizr.addTest("sessionstorage",function(){var e="modernizr";try{return sessionStorage.setItem(e,e),sessionStorage.removeItem(e),!0}catch(n){return!1}});var C=n.documentElement,T="svg"===C.nodeName.toLowerCase(),_=x._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];x._prefixes=_,Modernizr.addTest("csscalc",function(){var e="width:",n="calc(10px);",t=a("a");return t.style.cssText=e+_.join(n+e),!!t.style.length});var b="Moz O ms Webkit",E=x._config.usePrefixes?b.split(" "):[];x._cssomPrefixes=E;var P=function(n){var r,o=_.length,s=e.CSSRule;if("undefined"==typeof s)return t;if(!n)return!1;if(n=n.replace(/^@/,""),r=n.replace(/-/g,"_").toUpperCase()+"_RULE",r in s)return"@"+n;for(var a=0;o>a;a++){var i=_[a],l=i.toUpperCase()+"_"+r;if(l in s)return"@-"+i.toLowerCase()+"-"+n}return!1};x.atRule=P;var N=x._config.usePrefixes?b.toLowerCase().split(" "):[];x._domPrefixes=N;var z={elem:a("modernizr")};Modernizr._q.push(function(){delete z.elem});var j={style:z.elem.style};Modernizr._q.unshift(function(){delete j.style}),x.testAllProps=g,x.testAllProps=h,Modernizr.addTest("flexbox",h("flexBasis","1px",!0)),Modernizr.addTest("flexwrap",h("flexWrap","wrap",!0));var L=x.prefixed=function(e,n,t){return 0===e.indexOf("@")?P(e):(-1!=e.indexOf("-")&&(e=i(e)),n?g(e,n,t):g(e,"pfx"))};Modernizr.addTest("objectfit",!!L("objectFit"),{aliases:["object-fit"]}),Modernizr.addTest("video",function(){var e=a("video"),n=!1;try{n=!!e.canPlayType,n&&(n=new Boolean(n),n.ogg=e.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),n.h264=e.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),n.webm=e.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,""),n.vp9=e.canPlayType('video/webm; codecs="vp9"').replace(/^no$/,""),n.hls=e.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/,""))}catch(t){}return n}),o(),s(w),delete x.addTest,delete x.addAsyncTest;for(var O=0;O<Modernizr._q.length;O++)Modernizr._q[O]();e.Modernizr=Modernizr}(window,document);