"use strict";var themes=require("../../themes"),tools=require("../../tools"),_=require("lodash"),chalk=require("chalk"),needle=require("needle"),noon=require("noon"),CFILE=process.env.HOME+"/.leximaven.noon";exports.command="relate <word>",exports.desc="Wordnik related words",exports.builder={out:{alias:"o",desc:"Write cson, json, noon, plist, yaml, xml","default":"",type:"string"},force:{alias:"f",desc:"Force overwriting outfile","default":!1,type:"boolean"},save:{alias:"s",desc:"Save flags to config file","default":!1,type:"boolean"},limit:{alias:"l",desc:"Limit results = require(type option","default":10,type:"number"},canon:{alias:"c",desc:"Use canonical","default":!1,type:"boolean"},type:{alias:"t",desc:"Relationship types to limit","default":"",type:"string"}},exports.handler=function(e){tools.checkConfig(CFILE);var o=noon.load(CFILE),t={relate:{canon:e.c,type:e.t,limit:e.l}};o.merge&&(o=_.merge({},o,t));var r=themes.loadTheme(o.theme);o.verbose&&themes.labelDown("Wordnik",r,null);var l=e.word,s="relatedWords",a="http://api.wordnik.com:80/v4/word.json/",n=process.env.WORDNIK,i=""+a+l+"/"+s+"?",d=[];d.push("useCanonical="+o.relate.canon+"&"),""!==o.relate.type&&d.push("relationshipTypes="+o.relate.type+"&"),d.push("limitPerRelationshipType="+o.relate.limit+"&"),d.push("api_key="+n);var p=d.join(""),c=""+i+p;c=encodeURI(c),themes.labelDown("Related words",r,null);var u={type:"related words",source:"http://www.wordnik.com"};u.word=l,needle.get(c,function(t,l){if(t||200!==l.statusCode)console.error(chalk.red.bold("HTTP "+l.statusCode+":")+" "+chalk.red(t));else{for(var s=l.body,a=0;a<=s.length-1;a++){var n=s[a];themes.labelRight(n.relationshipType,r,""+n.words.join(", ")),u[["type"+a]]=n.relationshipType,u[["words"+a]]=n.words.join(", ")}e.o&&tools.outFile(e.o,e.f,u),e.s&&o.merge&&noon.save(CFILE,o),e.s&&!o.merge&&console.err(chalk.red("Set option merge to true!"))}})};