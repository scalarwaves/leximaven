'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var http = require('good-guy-http')();
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'urban <query>';
exports.desc = 'Urban Dictionary definitions';
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
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var userConfig = {
    urban: {
      limit: argv.l
    }
  };
  if (config.merge) config = _.merge({}, config, userConfig);
  if (argv.s && config.merge) noon.save(CFILE, config);
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.label(theme, 'down', 'Urban Dictionary');
  var ucont = [];
  ucont.push(argv.query);
  if (argv._.length > 1) {
    _.each(argv._, function (value) {
      if (value !== 'urban') ucont.push(value);
    });
  }
  var words = '';
  if (ucont.length > 1) {
    words = ucont.join('+');
  } else {
    words = ucont[0];
  }
  var url = 'http://api.urbandictionary.com/v0/define?term=' + words;
  url = encodeURI(url);
  var tofile = {
    type: 'urban',
    source: 'http://www.urbandictionary.com',
    url: url
  };
  http({ url: url }, function (error, response) {
    if (!error && response.statusCode === 200) {
      var body = JSON.parse(response.body);
      var limit = config.urban.limit;
      var list = body.list.slice(0, limit);
      for (var i = 0; i <= list.length - 1; i++) {
        var result = list[i];
        themes.label(theme, 'down', 'Definition', result.definition);
        tofile[['definition' + i]] = result.definition;
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
    } else {
      throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
    }
  });
};