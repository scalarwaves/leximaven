"use strict";var themes=require("../../themes"),tools=require("../../tools"),_=require("lodash"),chalk=require("chalk"),needle=require("needle"),noon=require("noon"),CFILE=process.env.HOME+"/.leximaven.noon";exports.command="phrase <word>",exports.desc="Wordnik bi-gram phrases",exports.builder={out:{alias:"o",desc:"Write cson, json, noon, plist, yaml, xml","default":"",type:"string"},force:{alias:"f",desc:"Force overwriting outfile","default":!1,type:"boolean"},save:{alias:"s",desc:"Save flags to config file","default":!1,type:"boolean"},limit:{alias:"l",desc:"Limit number of results","default":5,type:"number"},canon:{alias:"c",desc:"Use canonical","default":!1,type:"boolean"},weight:{alias:"w",desc:"Minimum weighted mutual info","default":13,type:"number"}},exports.handler=function(e){tools.checkConfig(CFILE);var o=noon.load(CFILE),r={phrase:{canon:e.c,limit:e.l,weight:e.w}};o.merge&&(o=_.merge({},o,r));var a=themes.loadTheme(o.theme);o.verbose&&themes.labelDown("Wordnik",a,null);var s=e.word,l="phrases",n="http://api.wordnik.com:80/v4/word.json/",t=process.env.WORDNIK,i=""+n+s+"/"+l+"?",c=[];c.push("useCanonical="+e.c+"&"),c.push("limit="+e.l+"&"),c.push("wlmi="+e.w+"&"),c.push("api_key="+t);var d=c.join(""),m=""+i+d;m=encodeURI(m),themes.labelDown("Bi-gram phrases",a,null);var u={type:"phrase",source:"http://www.wordnik.com"};needle.get(m,function(r,a){if(r||200!==a.statusCode)console.error(chalk.red.bold("HTTP "+a.statusCode+":")+" "+chalk.red(r));else{for(var s=a.body,l=0;l<=s.length-1;l++){var n=s[l];console.log(n.gram1+" "+n.gram2),u[["agram"+l]]=n.gram1,u[["bgram"+l]]=n.gram2}e.o&&tools.outFile(e.o,e.f,u),e.s&&o.merge&&noon.save(CFILE,o),e.s&&!o.merge&&console.err(chalk.red("Set option merge to true!"))}})};