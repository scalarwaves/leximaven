"use strict";var themes=require("../../themes"),tools=require("../../tools"),_=require("lodash"),chalk=require("chalk"),needle=require("needle"),noon=require("noon"),CFILE=process.env.HOME+"/.leximaven.noon";exports.command="hyphen <word>",exports.desc="Wordnik hyphenations",exports.builder={out:{alias:"o",desc:"Write cson, json, noon, plist, yaml, xml","default":"",type:"string"},force:{alias:"f",desc:"Force overwriting outfile","default":!1,type:"boolean"},save:{alias:"s",desc:"Save flags to config file","default":!1,type:"boolean"},limit:{alias:"l",desc:"Limit number of results","default":5,type:"number"},canon:{alias:"c",desc:"Use canonical","default":!1,type:"boolean"},dict:{alias:"d",desc:"Source dictionary ahd, century, wiktionary, webster, wordnet","default":"all",type:"string"}},exports.handler=function(e){tools.checkConfig(CFILE);var o=noon.load(CFILE),t={hyphen:{canon:e.c,dict:e.d,limit:e.l}};o.merge&&(o=_.merge({},o,t));var s=themes.loadTheme(o.theme);o.verbose&&themes.labelDown("Wordnik",s,null);var r=e.word,n="hyphenation",l="http://api.wordnik.com:80/v4/word.json/",a=process.env.WORDNIK,i=""+l+r+"/"+n+"?",c=[];c.push("useCanonical="+o.hyphen.canon+"&"),"all"!==e.d&&c.push("sourceDictionary="+o.hyphen.dict+"&"),c.push("limit="+o.hyphen.limit+"&"),c.push("api_key="+a);var d=c.join(""),h=""+i+d;h=encodeURI(h);var u={type:"hyphenation",source:"http://www.wordnik.com"},p=_.get(chalk,s.content.style);needle.get(h,function(t,r){if(t||200!==r.statusCode)console.error(chalk.red.bold("HTTP "+r.statusCode+":")+" "+chalk.red(t));else{var n=r.body;themes.labelRight("Hyphenation",s,null);for(var l=0;l<=n.length-1;l++){var a=n[l];"stress"===a.type?(process.stdout.write(""+chalk.red.bold(a.text)),u[["stress"+l]]=a.text):"secondary stress"===a.type?(process.stdout.write(p(a.text)),u[["secondary"+l]]=a.text):(process.stdout.write(p(a.text)),u[["syllable"+l]]=a.text),l<n.length-1&&process.stdout.write(p("-"))}console.log(""),e.o&&tools.outFile(e.o,e.f,u),e.s&&o.merge&&noon.save(CFILE,o),e.s&&!o.merge&&console.err(chalk.red("Set option merge to true!"))}})};