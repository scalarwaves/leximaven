'use strict';

var themes = require('../../themes');
var tools = require('../../tools');

var chalk = require('chalk');
var dot = require('dotty');
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'set <key> <value>';
exports.desc = 'Set a config value';
exports.builder = {};
exports.handler = function (argv) {
  var key = argv.key;
  var value = argv.value;
  value = tools.checkBoolean(value);
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.label(theme, 'down', 'Configuration');
  if (dot.exists(config, key)) {
    if (/\./i.test(key)) {
      if (/^\w*\.date/i.test(key)) {
        throw new Error("API limits hardcoded, can't set this key.");
      } else {
        dot.put(config, key, value);
      }
    } else {
      config[key] = value;
    }
  } else {
    throw new Error('Option ' + key + ' not found.');
  }
  noon.save(CFILE, config);
  console.log('Set option ' + chalk.white.bold(key) + ' to ' + chalk.white.bold(value) + '.');
};