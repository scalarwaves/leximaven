"use strict";var themes=require("../../themes"),tools=require("../../tools"),_=require("lodash"),chalk=require("chalk"),needle=require("needle"),noon=require("noon"),CFILE=process.env.HOME+"/.leximaven.noon";exports.command="pronounce <word>",exports.desc="Wordnik pronunciations",exports.builder={out:{alias:"o",desc:"Write cson, json, noon, plist, yaml, xml","default":"",type:"string"},force:{alias:"f",desc:"Force overwriting outfile","default":!1,type:"boolean"},save:{alias:"s",desc:"Save flags to config file","default":!1,type:"boolean"},limit:{alias:"l",desc:"Limit number of results","default":5,type:"number"},canon:{alias:"c",desc:"Use canonical","default":!1,type:"boolean"},dict:{alias:"d",desc:"Dictionary: ahd, century, cmu, macmillan, wiktionary, webster, wordnet","default":"",type:"string"},type:{alias:"t",desc:"Type: ahd, arpabet, gcide-diacritical, ipa","default":"",type:"string"}},exports.handler=function(e){tools.checkConfig(CFILE);var o=noon.load(CFILE),n={pronounce:{canon:e.c,dict:e.d,type:e.t,limit:e.l}};o.merge&&(o=_.merge({},o,n));var r=themes.loadTheme(o.theme);o.verbose&&themes.labelDown("Wordnik",r,null);var t=e.word,a="pronunciations",i="http://api.wordnik.com:80/v4/word.json/",s=process.env.WORDNIK,l=""+i+t+"/"+a+"?",c=[];c.push("useCanonical="+o.pronounce.canon+"&"),""!==o.pronounce.dict&&c.push("sourceDictionary="+o.pronounce.dict+"&"),""!==o.pronounce.type&&c.push("typeFormat="+o.pronounce.type+"&"),c.push("limit="+o.pronounce.limit+"&"),c.push("api_key="+s);var d=c.join(""),u=""+l+d;u=encodeURI(u),themes.labelDown("Pronunciations",r,null);var p={type:"pronunciation",source:"http://www.wordnik.com"};p.word=t,needle.get(u,function(n,a){if(n||200!==a.statusCode)console.error(chalk.red.bold("HTTP "+a.statusCode+":")+" "+chalk.red(n));else{for(var i=a.body,s=0;s<=i.length-1;s++){var l=i[s];themes.labelRight(t,r,l.raw+" - Type - "+l.rawType),p[["pronunciation"+s]]=l.raw,p[["type"+s]]=l.rawType}e.o&&tools.outFile(e.o,e.f,p),e.s&&o.merge&&noon.save(CFILE,o),e.s&&!o.merge&&console.err(chalk.red("Set option merge to true!"))}})};