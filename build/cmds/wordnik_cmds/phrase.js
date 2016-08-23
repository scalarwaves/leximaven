'use strict';

/* eslint max-len:0 */
var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var moment = require('moment');
var http = require('good-guy-http')();
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'phrase <word>';
exports.desc = 'Wordnik bi-gram phrases';
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
  limit: {
    alias: 'l',
    desc: 'Limit number of results',
    default: 5,
    type: 'number'
  },
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean'
  },
  weight: {
    alias: 'w',
    desc: 'Minimum weighted mutual info',
    default: 13,
    type: 'number'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var reset = false;
  var stamp = new Date(config.wordnik.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var checkStamp = tools.limitWordnik(config);
  config = checkStamp[0];
  proceed = checkStamp[1];
  reset = checkStamp[2];
  if (proceed) {
    (function () {
      var userConfig = {
        wordnik: {
          phrase: {
            canon: argv.c,
            limit: argv.l,
            weight: argv.w
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Wordnik');
      var word = argv.word;
      var task = 'phrases';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + argv.c + '&');
      pcont.push('limit=' + argv.l + '&');
      pcont.push('wlmi=' + argv.w + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      themes.label(theme, 'down', 'Bi-gram phrases');
      var tofile = {
        type: 'phrase',
        source: 'http://www.wordnik.com',
        url: url
      };
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = JSON.parse(response.body);
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            console.log(item.gram1 + ' ' + item.gram2);
            tofile[['agram' + i]] = item.gram1;
            tofile[['bgram' + i]] = item.gram2;
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (reset) {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour.');
          } else {
            if (config.usage) console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
          }
        } else {
          throw new Error('HTTP ' + response.statusCode + ': ' + error);
        }
      });
    })();
  } else {
    throw new Error('Reached this hour\'s usage limit of ' + config.wordnik.date.limit + '.');
  }
};