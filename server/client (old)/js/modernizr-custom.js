/*! modernizr 3.6.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-audio-es5-es5array-es5date-es5function-es5object-es5string-es5syntax-json-strictmode-xhrresponsetypejson-setclasses !*/
!function(window,document,undefined){function is(e,r){return typeof e===r}function testRunner(){var e,r,t,n,o,s,i;for(var a in tests)if(tests.hasOwnProperty(a)){if(e=[],r=tests[a],r.name&&(e.push(r.name.toLowerCase()),r.options&&r.options.aliases&&r.options.aliases.length))for(t=0;t<r.options.aliases.length;t++)e.push(r.options.aliases[t].toLowerCase());for(n=is(r.fn,"function")?r.fn():r.fn,o=0;o<e.length;o++)s=e[o],i=s.split("."),1===i.length?Modernizr[i[0]]=n:(!Modernizr[i[0]]||Modernizr[i[0]]instanceof Boolean||(Modernizr[i[0]]=new Boolean(Modernizr[i[0]])),Modernizr[i[0]][i[1]]=n),classes.push((n?"":"no-")+i.join("-"))}}function setClasses(e){var r=docElement.className,t=Modernizr._config.classPrefix||"";if(isSVG&&(r=r.baseVal),Modernizr._config.enableJSClass){var n=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");r=r.replace(n,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(r+=" "+t+e.join(" "+t),isSVG?docElement.className.baseVal=r:docElement.className=r)}function createElement(){return"function"!=typeof document.createElement?document.createElement(arguments[0]):isSVG?document.createElementNS.call(document,"http://www.w3.org/2000/svg",arguments[0]):document.createElement.apply(document,arguments)}var classes=[],tests=[],ModernizrProto={_version:"3.6.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,r){var t=this;setTimeout(function(){r(t[e])},0)},addTest:function(e,r,t){tests.push({name:e,fn:r,options:t})},addAsyncTest:function(e){tests.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=ModernizrProto,Modernizr=new Modernizr,Modernizr.addTest("json","JSON"in window&&"parse"in JSON&&"stringify"in JSON),Modernizr.addTest("es5array",function(){return!!(Array.prototype&&Array.prototype.every&&Array.prototype.filter&&Array.prototype.forEach&&Array.prototype.indexOf&&Array.prototype.lastIndexOf&&Array.prototype.map&&Array.prototype.some&&Array.prototype.reduce&&Array.prototype.reduceRight&&Array.isArray)}),Modernizr.addTest("es5date",function(){var e="2013-04-12T06:06:37.307Z",r=!1;try{r=!!Date.parse(e)}catch(t){}return!!(Date.now&&Date.prototype&&Date.prototype.toISOString&&Date.prototype.toJSON&&r)}),Modernizr.addTest("es5function",function(){return!(!Function.prototype||!Function.prototype.bind)}),Modernizr.addTest("es5object",function(){return!!(Object.keys&&Object.create&&Object.getPrototypeOf&&Object.getOwnPropertyNames&&Object.isSealed&&Object.isFrozen&&Object.isExtensible&&Object.getOwnPropertyDescriptor&&Object.defineProperty&&Object.defineProperties&&Object.seal&&Object.freeze&&Object.preventExtensions)}),Modernizr.addTest("strictmode",function(){"use strict";return!this}()),Modernizr.addTest("es5string",function(){return!(!String.prototype||!String.prototype.trim)}),Modernizr.addTest("es5syntax",function(){var value,obj,stringAccess,getter,setter,reservedWords,zeroWidthChars;try{return stringAccess=eval('"foobar"[3] === "b"'),getter=eval("({ get x(){ return 1 } }).x === 1"),eval("({ set x(v){ value = v; } }).x = 1"),setter=1===value,eval("obj = ({ if: 1 })"),reservedWords=1===obj["if"],zeroWidthChars=eval("_‌‍ = true"),stringAccess&&getter&&setter&&reservedWords&&zeroWidthChars}catch(ignore){return!1}});var docElement=document.documentElement,isSVG="svg"===docElement.nodeName.toLowerCase();Modernizr.addTest("audio",function(){var e=createElement("audio"),r=!1;try{r=!!e.canPlayType,r&&(r=new Boolean(r),r.ogg=e.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),r.mp3=e.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/,""),r.opus=e.canPlayType('audio/ogg; codecs="opus"')||e.canPlayType('audio/webm; codecs="opus"').replace(/^no$/,""),r.wav=e.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),r.m4a=(e.canPlayType("audio/x-m4a;")||e.canPlayType("audio/aac;")).replace(/^no$/,""))}catch(t){}return r}),Modernizr.addTest("es5undefined",function(){var e,r;try{r=window.undefined,window.undefined=12345,e="undefined"==typeof window.undefined,window.undefined=r}catch(t){return!1}return e}),Modernizr.addTest("es5",function(){return!!(Modernizr.es5array&&Modernizr.es5date&&Modernizr.es5function&&Modernizr.es5object&&Modernizr.strictmode&&Modernizr.es5string&&Modernizr.json&&Modernizr.es5syntax&&Modernizr.es5undefined)});var testXhrType=function(e){if("undefined"==typeof XMLHttpRequest)return!1;var r=new XMLHttpRequest;r.open("get","/",!0);try{r.responseType=e}catch(t){return!1}return"response"in r&&r.responseType==e};Modernizr.addTest("xhrresponsetypejson",testXhrType("json")),testRunner(),setClasses(classes),delete ModernizrProto.addTest,delete ModernizrProto.addAsyncTest;for(var i=0;i<Modernizr._q.length;i++)Modernizr._q[i]();window.Modernizr=Modernizr}(window,document);