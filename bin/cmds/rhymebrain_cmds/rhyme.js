"use strict";var themes=require("../../themes"),tools=require("../../tools"),_=require("lodash"),chalk=require("chalk"),needle=require("needle"),noon=require("noon"),CFILE=process.env.HOME+"/.leximaven.noon";exports.command="rhyme <word>",exports.desc="Rhymebrain rhymes",exports.builder={out:{alias:"o",desc:"Write cson, json, noon, plist, yaml, xml","default":"",type:"string"},force:{alias:"f",desc:"Force overwriting outfile","default":!1,type:"boolean"},save:{alias:"s",desc:"Save flags to config file","default":!1,type:"boolean"},lang:{alias:"l",desc:"ISO 639-1 language code","default":"en",type:"string"},max:{alias:"m",desc:"Max results to return","default":50,type:"number"}},exports.handler=function(e){tools.checkConfig(CFILE);var o=noon.load(CFILE),r={rhyme:{lang:e.l,max:e.m}};o.merge&&(o=_.merge({},o,r));var t=themes.loadTheme(o.theme);o.verbose&&themes.labelDown("Rhymebrain",t,null);var a=e.word,s="Rhymes",l="http://rhymebrain.com/talk?function=get",n=""+l+s+"&word="+a+"&",m=[];m.push("lang="+o.rhyme.lang+"&"),m.push("maxResults="+o.rhyme.max+"&");var i=m.join(""),h=""+n+i;h=encodeURI(h);var d={type:"rhyme",source:"http://rhymebrain.com"},c=_.get(chalk,t.content.style);needle.get(h,function(r,a){if(r||200!==a.statusCode)console.error(chalk.red.bold("HTTP "+a.statusCode+":")+" "+chalk.red(r));else{for(var s=a.body,l=[],n=0;n<=s.length-1;n++){var m=s[n];l.push(c(""+m.word)),m.score>=300?d[["hiscore"+n]]=m.word:d[["rhyme"+n]]=m.word}themes.labelRight("Rhymes",t,l.join(",")),e.o&&tools.outFile(e.o,e.f,d),e.s&&o.merge&&noon.save(CFILE,o),e.s&&!o.merge&&console.err(chalk.red("Set option merge to true!"))}})};