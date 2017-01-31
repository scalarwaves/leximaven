'use strict';/* eslint max-len: 0 */var chalk=require('chalk');var df=require('date-fns');var fs=require('fs-extra');var noon=require('noon');var ts=require('term-size');var wrap=require('wrap-ansi');var xml2js=require('xml2js');var CFILE=process.env.HOME+'/.leximaven.noon';/**
  * The tools module provides useful repetitive tasks
  * @module Utils
  *//**
  * Onelook's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */exports.limitOnelook=function(config){var c=config;var proceed=false;var reset=false;var stamp=new Date(c.onelook.date.stamp);var hours=df.differenceInHours(new Date(),stamp);if(hours<24){c.onelook.date.remain--;}else if(hours>=24){reset=true;c.onelook.date.stamp=new Date().toJSON();c.onelook.date.remain=c.onelook.date.limit;c.onelook.date.remain--;}c.onelook.date.remain<=0?c.onelook.date.remain=0:proceed=true;noon.save(CFILE,c);return[c,proceed,reset];};/**
  * Datamuse's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */exports.limitDmuse=function(config){var c=config;var proceed=false;var reset=false;var stamp=new Date(c.dmuse.date.stamp);var hours=df.differenceInHours(new Date(),stamp);if(hours<24){c.dmuse.date.remain--;}else if(hours>=24){reset=true;c.dmuse.date.stamp=new Date().toJSON();c.dmuse.date.remain=c.dmuse.date.limit;c.dmuse.date.remain--;}c.dmuse.date.remain<=0?c.dmuse.date.remain=0:proceed=true;noon.save(CFILE,c);return[c,proceed,reset];};/**
  * Rhymebrain's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */exports.limitRbrain=function(config){var c=config;var proceed=false;var reset=false;var stamp=new Date(c.rbrain.date.stamp);var minutes=df.differenceInMinutes(new Date(),stamp);if(minutes<60){c.rbrain.date.remain--;}else if(minutes>=60){reset=true;c.rbrain.date.stamp=new Date().toJSON();c.rbrain.date.remain=c.rbrain.date.limit;c.rbrain.date.remain--;}c.rbrain.date.remain<=0?c.rbrain.date.remain=0:proceed=true;noon.save(CFILE,c);return[c,proceed,reset];};/**
  * Wordnik's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */exports.limitWordnik=function(config){var c=config;var proceed=false;var reset=false;var stamp=new Date(c.wordnik.date.stamp);var minutes=df.differenceInMinutes(new Date(),stamp);if(minutes<60){c.wordnik.date.remain--;}else if(minutes>=60){reset=true;c.wordnik.date.stamp=new Date().toJSON();c.wordnik.date.remain=c.wordnik.date.limit;c.wordnik.date.remain--;}c.wordnik.date.remain<=0?c.wordnik.date.remain=0:proceed=true;noon.save(CFILE,c);return[c,proceed,reset];};/**
  * Checks if a file exists
  * @private
  * @param {string} path The filename to check.
  * @return {boolean} fileExists
  */function checkOutfile(path){var fileExists=null;try{fs.statSync(path);fileExists=true;}catch(e){if(e.code==='ENOENT')fileExists=false;}return fileExists;}/**
  * Converts string to boolean
  * @public
  * @param {string} value
  * @return {boolean} v
  */exports.checkBoolean=function(value){var v=value;if(v==='true')v=true;if(v==='false')v=false;return v;};/**
 * Converts a boolean to a 0 or 1
 * @param  {boolean} value A boolean value
 * @return {integer} 0 or 1
 */exports.boolToBin=function(value){var r=null;value?r=1:r=0;return r;};/**
  * Checks if config exists. If not, prints init message and exits with error code.
  * @public
  * @param {string} file Configuration filepath
  */exports.checkConfig=function(file){try{fs.statSync(file);}catch(e){if(e.code==='ENOENT')throw new Error('No config found at '+file+', run: \'leximaven config init\'');}return true;};/**
  * Checks if object is a single string in an array
  * @public
  * @param {Object} obj Any object
  * @return {Object} Original object or extracted string
  */exports.arrToStr=function(obj){var fixed=null;Array.isArray(obj)&&obj.length===1&&typeof obj[0]==='string'?fixed=obj[0]:fixed=obj;return fixed;};/**
  * Strips HTML from a string
  * @public
  * @param  {string} string Text with HTML tags
  * @return {string} Plain text string
  */exports.stripHTML=function(string){return string.replace(/(<([^>]+)>)/ig,'');};/**
  * Wraps blocks of text
  * @param  {string} str Long string
  * @param  {boolean} hard true, soft false
  * @param  {boolean} wwrap true, column wrap false
  * @return {string} ANSI-wrapped string
  */exports.wrapStr=function(str,hard,wwrap){var termsize=ts();return wrap(str,termsize.columns,hard,wwrap);};/**
  * Handles data export to file. Supports cson, json, noon, plist, xml, yaml.
  * @public
  * @param {string} path The desired filepath and extension
  * @param {boolean} force Whether to force overwrite
  * @param {Object} tofile A numbered object of data points
  */exports.outFile=function(path,force,tofile){var match=path.match(/\.([a-z]*)$/i);var ext=match[1];var builder=new xml2js.Builder();if(ext==='xml'){if(checkOutfile(path)){if(force){var xml=builder.buildObject(tofile);var fd=fs.openSync(path,'w+');fs.writeSync(fd,xml);fs.closeSync(fd);console.log(chalk.white('Overwrote '+path+' with data.'));}else console.log(chalk.white(path+' exists, use -f to force overwrite.'));}else{var _xml=builder.buildObject(tofile);var _fd=fs.openSync(path,'w+');fs.writeSync(_fd,_xml);fs.closeSync(_fd);console.log(chalk.white('Wrote data to '+path+'.'));}}else if(ext==='cson'||ext==='json'||ext==='noon'||ext==='plist'||ext==='yml'||ext==='yaml'){if(checkOutfile(path)){if(force){noon.save(path,tofile);console.log(chalk.white('Overwrote '+path+' with data.'));}else console.log(chalk.white(path+' exists, use -f to force overwrite.'));}else{noon.save(path,tofile);console.log(chalk.white('Wrote data to '+path+'.'));}}else if(ext!=='xml'||ext!=='cson'||ext!=='json'||ext!=='noon'||ext!=='plist'||ext!=='yml'||ext!=='yaml')throw new Error('Format '+ext+' not supported.');};