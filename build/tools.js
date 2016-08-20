'use strict';

/* eslint max-len: 0 */
var chalk = require('chalk');
var fs = require('fs');
var moment = require('moment');
var noon = require('noon');
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.leximaven.noon';

/**
  * The tools module provides useful repetitive tasks
  * @module Utils
  */

/**
  * Onelook's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */
exports.limitOnelook = function (config) {
  var c = config;
  var proceed = false;
  var reset = false;
  var stamp = new Date(c.onelook.date.stamp);
  var hours = moment(new Date()).diff(stamp, 'hours');
  if (hours < 24 || hours < 0) {
    c.onelook.date.remain--;
    noon.save(CFILE, c);
  } else if (hours >= 24) {
    reset = true;
    c.onelook.date.stamp = new Date().toJSON();
    c.onelook.date.remain = c.onelook.date.limit;
    console.log(chalk.white('Reset API limit to ' + c.onelook.date.limit + '/' + c.onelook.date.interval + '.'));
    c.onelook.date.remain--;
    noon.save(CFILE, c);
  }
  if (c.onelook.date.remain === 0) {
    proceed = false;
  } else if (c.onelook.date.remain < 0) {
    proceed = false;
    c.onelook.date.remain = 0;
    noon.save(CFILE, c);
  } else {
    proceed = true;
  }
  return [c, proceed, reset];
};

/**
  * Datamuse's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */
exports.limitDmuse = function (config) {
  var c = config;
  var proceed = false;
  var reset = false;
  var stamp = new Date(c.dmuse.date.stamp);
  var hours = moment(new Date()).diff(stamp, 'hours');
  if (hours < 24) {
    c.dmuse.date.remain--;
    noon.save(CFILE, c);
  } else if (hours >= 24) {
    reset = true;
    c.dmuse.date.stamp = new Date().toJSON();
    c.dmuse.date.remain = c.dmuse.date.limit;
    console.log(chalk.white('Reset API limit to ' + c.dmuse.date.limit + '/' + c.dmuse.date.interval + '.'));
    c.dmuse.date.remain--;
    noon.save(CFILE, c);
  }
  if (c.dmuse.date.remain === 0) {
    proceed = false;
  } else if (c.dmuse.date.remain < 0) {
    proceed = false;
    c.dmuse.date.remain = 0;
    noon.save(CFILE, c);
  } else {
    proceed = true;
  }
  return [c, proceed, reset];
};

/**
  * Rhymebrain's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */
exports.limitRbrain = function (config) {
  var c = config;
  var proceed = false;
  var reset = false;
  var stamp = new Date(c.rbrain.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  if (minutes < 60) {
    c.rbrain.date.remain--;
    noon.save(CFILE, c);
  } else if (minutes >= 60) {
    reset = true;
    c.rbrain.date.stamp = new Date().toJSON();
    c.rbrain.date.remain = c.rbrain.date.limit;
    console.log(chalk.white('Reset API limit to ' + c.rbrain.date.limit + '/' + c.rbrain.date.interval + '.'));
    c.rbrain.date.remain--;
    noon.save(CFILE, c);
  }
  if (c.rbrain.date.remain === 0) {
    proceed = false;
  } else if (c.rbrain.date.remain < 0) {
    proceed = false;
    c.rbrain.date.remain = 0;
    noon.save(CFILE, c);
  } else {
    proceed = true;
  }
  return [c, proceed, reset];
};

/**
  * Wordnik's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */
exports.limitWordnik = function (config) {
  var c = config;
  var proceed = false;
  var reset = false;
  var stamp = new Date(c.wordnik.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  if (minutes < 60) {
    c.wordnik.date.remain--;
    noon.save(CFILE, c);
  } else if (minutes >= 60) {
    reset = true;
    c.wordnik.date.stamp = new Date().toJSON();
    c.wordnik.date.remain = c.wordnik.date.limit;
    console.log(chalk.white('Reset API limit to ' + c.wordnik.date.limit + '/' + c.wordnik.date.interval + '.'));
    c.wordnik.date.remain--;
    noon.save(CFILE, c);
  }
  if (c.wordnik.date.remain === 0) {
    proceed = false;
  } else if (c.wordnik.date.remain < 0) {
    proceed = false;
    c.wordnik.date.remain = 0;
    noon.save(CFILE, c);
  } else {
    proceed = true;
  }
  return [c, proceed, reset];
};

/**
  * Checks if a file exists
  * @private
  * @param {string} path The filename to check.
  * @return {boolean} fileExists
  */
function checkOutfile(path) {
  var fileExists = null;
  try {
    fs.statSync(path);
    fileExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      fileExists = false;
    }
  }
  return fileExists;
}

/**
  * Converts string to boolean
  * @public
  * @param {string} value
  * @return {boolean} v
  */
exports.checkBoolean = function (value) {
  var v = value;
  if (v === 'true') v = true;
  if (v === 'false') v = false;
  return v;
};

/**
  * Checks if config exists. If not, prints init message and exits with error code.
  * @public
  * @param {string} file Configuration filepath
  */
exports.checkConfig = function (file) {
  try {
    fs.statSync(file);
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error('No config found at ' + file + ', run: \'leximaven config init\'');
    }
  }
  return true;
};

/**
  * Checks if object is a single string in an array
  * @public
  * @param {Object} obj Any object
  * @return {Object} Original object or extracted string
  */
exports.arrToStr = function (obj) {
  var fixed = null;
  Array.isArray(obj) && obj.length === 1 && typeof obj[0] === 'string' ? fixed = obj[0] : fixed = obj;
  return fixed;
};

/**
  * Handles data export to file. Supports cson, json, noon, plist, xml, yaml.
  * @public
  * @param {string} path The desired filepath and extension
  * @param {boolean} force Whether to force overwrite
  * @param {Object} tofile A numbered object of data points
  */
exports.outFile = function (path, force, tofile) {
  var match = path.match(/\.([a-z]*)$/i);
  var ext = match[1];
  var builder = new xml2js.Builder();
  if (ext === 'xml') {
    if (checkOutfile(path)) {
      if (force) {
        var xml = builder.buildObject(tofile);
        var fd = fs.openSync(path, 'w+');
        fs.writeSync(fd, xml);
        fs.closeSync(fd);
        console.log(chalk.white('Overwrote ' + path + ' with data.'));
      } else {
        console.log(chalk.white(path + ' exists, use -f to force overwrite.'));
      }
    } else {
      var _xml = builder.buildObject(tofile);
      var _fd = fs.openSync(path, 'w+');
      fs.writeSync(_fd, _xml);
      fs.closeSync(_fd);
      console.log(chalk.white('Wrote data to ' + path + '.'));
    }
  } else if (ext === 'cson' || ext === 'json' || ext === 'noon' || ext === 'plist' || ext === 'yml' || ext === 'yaml') {
    if (checkOutfile(path)) {
      if (force) {
        noon.save(path, tofile);
        console.log(chalk.white('Overwrote ' + path + ' with data.'));
      } else {
        console.log(chalk.white(path + ' exists, use -f to force overwrite.'));
      }
    } else {
      noon.save(path, tofile);
      console.log(chalk.white('Wrote data to ' + path + '.'));
    }
  } else if (ext !== 'xml' || ext !== 'cson' || ext !== 'json' || ext !== 'noon' || ext !== 'plist' || ext !== 'yml' || ext !== 'yaml') throw new Error('Format ' + ext + ' not supported.');
};