'use strict';

/* eslint max-len:0, no-unused-vars:0 */
var tools = require('../../tools');

var chalk = require('chalk');
var moment = require('moment');
var http = require('good-guy-http')();
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'info';
exports.desc = 'Datamuse metrics';
exports.builder = {};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var url = 'http://api.datamuse.com/metrics';
  http({ url: url }, function (error, response) {
    if (!error && response.statusCode === 200) {
      var body = JSON.parse(response.body);
      var version = body[0];
      var qps = body[1];
      var sugf = body[2];
      var sugn = body[3];
      var wordf = body[4];
      var wordn = body[5];
      console.log(chalk.white('Current queries per second (v' + Math.round(version.value * 100) / 100.0 + '): ' + Math.round(qps.value * 100) / 100.0));
      console.log(chalk.white('Latency (/words): ' + Math.round(wordf.value * 100000) / 100.0 + ' ms (median), ' + Math.round(wordn.value * 100000) / 100.0 + ' ms (99 %ile)'));
      console.log(chalk.white('Latency (/sug): ' + Math.round(sugf.value * 100000) / 100.0 + ' ms (median), ' + Math.round(sugn.value * 100000) / 100.0 + ' ms (99 %ile)'));
    } else {
      throw new Error('HTTP ' + response.statusCode + ': ' + error);
    }
  });
  var limit = config.dmuse.date.limit;
  var remain = config.dmuse.date.remain;
  var stamp = new Date(config.dmuse.date.stamp);
  var hours = moment(new Date()).diff(stamp, 'hours');
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  console.log(chalk.white(remain + '/' + limit + ' requests remain today, will reset in ' + (23 - hours) + ' hours, ' + (59 - minutes) + ' minutes.'));
};