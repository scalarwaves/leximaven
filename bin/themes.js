'use strict';/* eslint max-len:0 */var _=require('lodash');var chalk=require('chalk');var fs=require('fs');var glob=require('glob');var noon=require('noon');var TDIR=null;var themeDirExists=null;try{fs.statSync('themes');themeDirExists=true;}catch(e){if(e.code==='ENOENT')themeDirExists=false;}themeDirExists?TDIR='themes/':TDIR=process.env.NODE_PATH+'/leximaven/themes/';/**
  * The themes module provides useful repetitive theme tasks
  * @module Themes
  *//**
  * Loads theme
  * @public
  * @param {string} theme The name of the theme
  * @return {Object} load The style to use
  */exports.loadTheme=function(theme){var dirExists=null;var load=null;try{fs.statSync('themes');dirExists=true;}catch(e){if(e.code==='ENOENT')dirExists=false;}if(!dirExists)console.log(chalk.white(process.cwd()+'/themes does not exist, falling back to '+process.env.NODE_PATH+'/leximaven/themes.'));load=noon.load(''+TDIR+theme+'.noon');return load;};/**
  * Gets themes for list command
  * @public
  * @return {Array} List of theme names
  */exports.getThemes=function(){var list=[];var dirExists=null;var files=[];try{fs.statSync('themes');dirExists=true;}catch(e){if(e.code==='ENOENT')dirExists=false;}if(!dirExists)console.log(chalk.white(process.cwd()+'/themes does not exist, falling back to '+process.env.NODE_PATH+'/leximaven/themes.'));files=glob.sync(TDIR+'*.noon');for(var i=0;i<=files.length-1;i++){list.push(files[i].replace(/[a-z0-9/_.]*themes\//,'').replace(/\.noon/,''));}return list;};/**
  * Prints label, connector, and content
  * @public
  * @param {Object} theme The style to use
  * @param {string} direction 'down' or 'right'
  * @param {string} text The label text
  * @param {string} [content] The text the label points at
  * @return {string} The stylized string to log
  */exports.label=function(theme,direction,text,content){var pstyle=_.get(chalk,theme.prefix.style);var tstyle=_.get(chalk,theme.text.style);var sstyle=_.get(chalk,theme.suffix.style);var cnstyle=_.get(chalk,theme.connector.style);var ctstyle=_.get(chalk,theme.content.style);var label=''+pstyle(theme.prefix.str)+tstyle(text)+sstyle(theme.suffix.str);if(direction==='right'){content!==null&&content!==undefined?label=''+label+cnstyle(theme.connector.str)+ctstyle(content):label=''+label;}else if(direction==='down'){content!==null&&content!==undefined?label=label+'\n'+cnstyle(theme.connector.str)+ctstyle(content):label=''+label;}else{throw new Error("Unsupported label direction, use 'down' or 'right'.");}console.log(label);return label;};