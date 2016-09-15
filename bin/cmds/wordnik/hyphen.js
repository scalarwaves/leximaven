'use strict';

/* eslint max-len:0 */
var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
var moment = require('moment');
var http = require('good-guy-http')();
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'hyphen <word>';
exports.desc = 'Wordnik hyphenations';
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
  dict: {
    alias: 'd',
    desc: 'Source dictionary ahd, century, wiktionary, webster, wordnet',
    default: 'all',
    type: 'string'
  }
};
exports.handler = function (argv) {
  if (process.env.WORDNIK === undefined) throw new Error('Put an API key in environment variable WORDNIK per documentation.');
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
          hyphen: {
            canon: argv.c,
            dict: argv.d,
            limit: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Wordnik');
      var word = argv.word;
      var task = 'hyphenation';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.hyphen.canon + '&');
      if (argv.d !== 'all') pcont.push('sourceDictionary=' + config.wordnik.hyphen.dict + '&');
      pcont.push('limit=' + config.wordnik.hyphen.limit + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      var tofile = {
        type: 'hyphenation',
        source: 'http://www.wordnik.com'
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          if (response.headers['x-gg-state'] === 'cached') {
            config.wordnik.date.remain++;
            noon.save(CFILE, config);
            if (config.usage) console.log('Cached response, not decrementing usage.');
          }
          var list = JSON.parse(response.body);
          var hcont = [];
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            if (item.type === 'stress') {
              hcont.push('' + chalk.red.bold(item.text));
              tofile[['stress' + i]] = item.text;
            } else if (item.type === 'secondary stress') {
              hcont.push(ctstyle(item.text));
              tofile[['secondary' + i]] = item.text;
            } else {
              hcont.push(ctstyle(item.text));
              tofile[['syllable' + i]] = item.text;
            }
            if (i < list.length - 1) hcont.push(ctstyle('-'));
          }
          themes.label(theme, 'right', 'Hyphenation', hcont.join(''));
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (config.usage) reset ? console.log('Timestamp expired, not decrementing usage.\n' + config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour.') : console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
        } else throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
      });
    })();
  } else throw new Error('Reached this hour\'s usage limit of ' + config.wordnik.date.limit + '.');
};