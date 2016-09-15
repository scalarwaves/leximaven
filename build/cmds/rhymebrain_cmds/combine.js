'use strict';

/* eslint max-len:0 */
var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var moment = require('moment');
var http = require('good-guy-http')();
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'combine <query>';
exports.desc = 'Rhymebrain portmanteaus';
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string'
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean'
  },
  save: {
    alias: 's',
    desc: 'Save flags to config file',
    default: false,
    type: 'boolean'
  },
  lang: {
    alias: 'l',
    desc: 'ISO 639-1 language code',
    default: 'en',
    type: 'string'
  },
  max: {
    alias: 'm',
    desc: 'Max results to return',
    default: 5,
    type: 'number'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var reset = false;
  var stamp = new Date(config.rbrain.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var checkStamp = tools.limitRbrain(config);
  config = checkStamp[0];
  proceed = checkStamp[1];
  reset = checkStamp[2];
  if (proceed) {
    (function () {
      var userConfig = {
        rbrain: {
          combine: {
            lang: argv.l,
            max: argv.m
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Rhymebrain');
      var query = argv.query;
      var task = 'Portmanteaus';
      var prefix = 'http://rhymebrain.com/talk?function=get';
      var uri = '' + prefix + task + '&word=' + query + '&';
      var pcont = [];
      pcont.push('lang=' + config.rbrain.combine.lang + '&');
      pcont.push('maxResults=' + config.rbrain.combine.max + '&');
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      themes.label(theme, 'down', task);
      var tofile = {
        type: 'portmanteau',
        source: 'http://rhymebrain.com',
        url: url
      };
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          if (response.headers['x-gg-state'] === 'cached') {
            config.rbrain.date.remain++;
            noon.save(CFILE, config);
            if (config.usage) console.log('Cached response, not decrementing usage.');
          }
          var list = JSON.parse(response.body);
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            themes.label(theme, 'right', item.source, item.combined);
            tofile[['set' + i]] = item.source;
            tofile[['portmanteau' + i]] = item.combined;
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (config.usage) reset ? console.log('Timestamp expired, reset usage limits.\n' + config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.') : console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
        } else throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
      });
    })();
  } else throw new Error('Reached this hour\'s usage limit of ' + config.rbrain.date.limit + '.');
};