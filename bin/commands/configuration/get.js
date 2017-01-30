'use strict';var themes=require('../../themes');var tools=require('../../tools');var chalk=require('chalk');var dot=require('dot-prop');var noon=require('noon');var CFILE=process.env.HOME+'/.leximaven.noon';exports.command='get <key>';exports.aliases=['g'];exports.desc='Retrieve a config value';exports.builder={};exports.handler=function(argv){var key=argv.key;var value=null;tools.checkConfig(CFILE);var config=noon.load(CFILE);var theme=themes.loadTheme(config.theme);if(config.verbose)themes.label(theme,'down','Configuration');if(dot.has(config,key)){value=/\./i.test(key)?dot.get(config,key):config[key];}else{throw new Error('Option '+key+' not found.');}console.log('Option '+chalk.white.bold(key)+' is '+chalk.white.bold(value)+'.');};