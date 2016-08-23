'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var chalk = require('chalk');
var moment = require('moment');
var http = require('good-guy-http')();
var noon = require('noon');
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'onelook <word>';
exports.desc = 'Onelook definitions';
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
  links: {
    alias: 'l',
    desc: 'Include resource links',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var reset = false;
  var checkStamp = tools.limitOnelook(config);
  config = checkStamp[0];
  proceed = checkStamp[1];
  reset = checkStamp[2];
  var stamp = new Date(config.onelook.date.stamp);
  var hours = moment(new Date()).diff(stamp, 'hours');
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  if (proceed) {
    (function () {
      var userConfig = {
        onelook: {
          links: argv.l
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Onelook');
      var url = 'http://onelook.com/?xml=1&w=' + argv.word;
      url = encodeURI(url);
      var tofile = {
        type: 'onelook',
        source: 'http://www.onelook.com',
        url: url
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          if (response.headers['x-gg-state'] === 'cached') {
            config.onelook.date.remain++;
            noon.save(CFILE, config);
            if (config.usage) console.log('Cached response, not decrementing usage.');
          }
          var body = response.body;
          var parser = new xml2js.Parser();
          parser.parseString(body, function (err, result) {
            var resp = result.OLResponse;
            var phrase = resp.OLPhrases[0];
            var similar = resp.OLSimilar[0];
            var quickdef = resp.OLQuickDef;
            var resources = resp.OLRes;
            themes.label(theme, 'down', 'Definition');
            if (Array.isArray(quickdef) && quickdef.length > 1) {
              for (var i = 0; i <= quickdef.length - 1; i++) {
                var item = quickdef[i];
                item = item.replace(/&lt;|&gt;|\n|\/i/g, '');
                item = item.replace(/i"/g, '"');
                console.log(ctstyle(item));
                tofile[['definition' + i]] = item;
              }
            } else {
              var definition = quickdef[0].replace(/&lt;|&gt;|\n|\/i/g, '');
              console.log(ctstyle(definition));
              tofile.definition = definition;
            }
            if (phrase) {
              var phrases = phrase.replace(/\n/g, '');
              themes.label(theme, 'down', 'Phrases', phrases);
              tofile.phrase = phrases;
            }
            if (similar) {
              var sim = similar.replace(/\n/g, '');
              themes.label(theme, 'down', 'Similar', sim);
              tofile.sim = sim;
            }
            if (config.onelook.links) {
              themes.label(theme, 'down', 'Resources');
              for (var _i = 0; _i <= resources.length - 1; _i++) {
                var _item = resources[_i];
                var res = tools.arrToStr(_item.OLResName).replace(/\n/g, '');
                var link = tools.arrToStr(_item.OLResLink).replace(/\n/g, '');
                var home = tools.arrToStr(_item.OLResHomeLink).replace(/\n/g, '');
                themes.label(theme, 'right', res, link);
                tofile[['res' + _i]] = res;
                tofile[['link' + _i]] = link;
                tofile[['home' + _i]] = home;
              }
            }
            if (argv.o) tools.outFile(argv.o, argv.f, tofile);
            if (config.usage) {
              if (reset) {
                console.log('Timestamp expired, reset usage limits.');
                console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today.');
              } else console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today, will reset in ' + (23 - hours) + ' hours, ' + (59 - minutes) + ' minutes.');
            }
          });
        } else throw new Error('HTTP ' + response.statusCode + ': ' + error);
      });
    })();
  } else throw new Error('Reached today\'s usage limit of ' + config.onelook.date.limit + '.');
};