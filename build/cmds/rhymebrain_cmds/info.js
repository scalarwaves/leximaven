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

exports.command = 'info <word>';
exports.desc = 'Rhymebrain word info';
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
          info: {
            lang: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Rhymebrain');
      var word = argv.word;
      var task = 'WordInfo';
      var prefix = 'http://rhymebrain.com/talk?function=get';
      var uri = '' + prefix + task + '&word=' + word + '&lang=' + config.rbrain.info.lang;
      var url = encodeURI(uri);
      themes.label(theme, 'down', 'Word Info');
      var tofile = {
        type: 'word info',
        source: 'http://rhymebrain.com',
        url: url
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          if (response.headers['x-gg-state'] === 'cached') {
            config.rbrain.date.remain++;
            noon.save(CFILE, config);
            if (config.usage) console.log('Cached response, not decrementing usage.');
          }
          var info = JSON.parse(response.body);
          themes.label(theme, 'right', 'Arpabet', info.pron);
          themes.label(theme, 'right', 'IPA', info.ipa);
          themes.label(theme, 'right', 'Syllables', info.syllables);
          tofile.arpabet = info.pron;
          tofile.ipa = info.ipa;
          tofile.syllables = info.syllables;
          var flags = [];
          if (info.flags.match(/a/)) {
            flags.push(ctstyle('[' + chalk.red.bold('Offensive') + ']'));
            tofile.offensive = true;
          }
          if (info.flags.match(/b/)) {
            flags.push(ctstyle('[Found in dictionary]'));
            tofile.dict = true;
          }
          if (info.flags.match(/c/)) {
            flags.push(ctstyle('[Trusted pronunciation, not generated]'));
            tofile.trusted = true;
          }
          themes.label(theme, 'right', 'Word Flags', flags.join(''));
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          reset ? console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.') : console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
        } else throw new Error('HTTP ' + response.statusCode + ': ' + error);
      });
    })();
  } else throw new Error('Reached this hour\'s usage limit of ' + config.rbrain.date.limit + '.');
};