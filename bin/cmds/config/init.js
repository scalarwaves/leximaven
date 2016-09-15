'use strict';

var themes = require('../../themes');

var chalk = require('chalk');
var fs = require('fs');
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';
var PKGDIR = process.env.NODE_PATH + '/leximaven/';

exports.command = 'init';
exports.desc = 'Initialize config file';
exports.builder = {
  force: {
    alias: 'f',
    desc: 'Force overwriting configuration file',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  var obj = null;
  var configExists = null;
  var dirExists = null;
  try {
    fs.statSync('default.config.noon');
    configExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') configExists = false;
  }
  if (configExists) {
    obj = noon.load('default.config.noon');
  } else {
    try {
      fs.statSync(PKGDIR);
      dirExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        dirExists = false;
      }
    }
    if (dirExists) {
      obj = noon.load(PKGDIR + 'default.config.noon');
    } else {
      throw new Error('Package dir not found, set NODE_PATH per documentation.');
    }
  }
  obj.dmuse.date.stamp = new Date().toJSON();
  obj.onelook.date.stamp = new Date().toJSON();
  obj.rbrain.date.stamp = new Date().toJSON();
  obj.wordnik.date.stamp = new Date().toJSON();
  var fileExists = null;
  try {
    fs.statSync(CFILE);
    fileExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      fileExists = false;
    }
  }
  if (fileExists) {
    if (argv.f) {
      var _config = noon.load(CFILE);
      obj.dmuse.date.stamp = _config.dmuse.date.stamp;
      obj.dmuse.date.remain = _config.dmuse.date.remain;
      obj.onelook.date.stamp = _config.onelook.date.stamp;
      obj.onelook.date.remain = _config.onelook.date.remain;
      obj.rbrain.date.stamp = _config.rbrain.date.stamp;
      obj.rbrain.date.remain = _config.rbrain.date.remain;
      obj.wordnik.date.stamp = _config.wordnik.date.stamp;
      obj.wordnik.date.remain = _config.wordnik.date.remain;
      noon.save(CFILE, obj);
      console.log('Overwrote ' + chalk.white.bold(CFILE) + '.');
    } else {
      console.log('Using configuration at ' + chalk.white.bold(CFILE) + '.');
    }
  } else if (!fileExists) {
    noon.save(CFILE, obj);
    console.log('Created ' + chalk.white.bold(CFILE) + '.');
  }
  var config = noon.load(CFILE);
  var theme = themes.loadTheme(config.theme);
  if (argv.v) {
    themes.label(theme, 'down', 'Configuration');
    console.log('Your current configuration is:');
    console.log(noon.stringify(config, {
      indent: 2,
      align: true,
      maxalign: 32,
      sort: true,
      colors: true
    }));
    console.log('');
  }
};