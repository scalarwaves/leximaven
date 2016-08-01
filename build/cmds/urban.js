'use strict';

var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var chalk = require('chalk');
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
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.labelDown('Urban Dictionary', theme, null);
  var ucont = [];
  ucont.push(argv.query);
  if (argv._.length > 1) {
    _.each(argv._, function (value) {
      ucont.push(value);
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
        themes.labelDown('Definition', theme, result.definition);
        tofile[['definition' + i]] = result.definition;
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
    } else {
      throw new Error('HTTP ' + response.statusCode + ': ' + error);
    }
  });
};
//# sourceMappingURL=data:application/json;base64,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LEdBQXRDLEVBQTJDO0FBQ3pDLFlBQU0sU0FBUyxLQUFLLENBQUwsQ0FBZjtBQUNBLGVBQU8sU0FBUCxDQUFpQixZQUFqQixFQUErQixLQUEvQixFQUFzQyxPQUFPLFVBQTdDO0FBQ0EsZUFBTyxnQkFBYyxDQUFkLENBQVAsSUFBNkIsT0FBTyxVQUFwQztBQUNEO0FBQ0QsVUFBSSxLQUFLLENBQVQsRUFBWSxNQUFNLE9BQU4sQ0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDWixVQUFJLEtBQUssQ0FBTCxJQUFVLE9BQU8sS0FBckIsRUFBNEIsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM1QixVQUFJLEtBQUssQ0FBTCxJQUFVLENBQUMsT0FBTyxLQUF0QixFQUE2QixNQUFNLElBQUksS0FBSixDQUFVLG1EQUFWLENBQU47QUFDOUIsS0FaRCxNQVlPO0FBQ0wsWUFBTSxJQUFJLEtBQUosV0FBa0IsU0FBUyxVQUEzQixVQUEwQyxLQUExQyxDQUFOO0FBQ0Q7QUFDRixHQWhCRDtBQWlCRCxDQWhERCIsImZpbGUiOiJjbWRzL3VyYmFuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2dvb2QtZ3V5LWh0dHAnKSgpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAndXJiYW4gPHF1ZXJ5PidcbmV4cG9ydHMuZGVzYyA9ICdVcmJhbiBEaWN0aW9uYXJ5IGRlZmluaXRpb25zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICB1cmJhbjoge1xuICAgICAgbGltaXQ6IGFyZ3YubCxcbiAgICB9LFxuICB9XG4gIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdVcmJhbiBEaWN0aW9uYXJ5JywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHVjb250ID0gW11cbiAgdWNvbnQucHVzaChhcmd2LnF1ZXJ5KVxuICBpZiAoYXJndi5fLmxlbmd0aCA+IDEpIHtcbiAgICBfLmVhY2goYXJndi5fLCAodmFsdWUpID0+IHtcbiAgICAgIHVjb250LnB1c2godmFsdWUpXG4gICAgfSlcbiAgfVxuICBsZXQgd29yZHMgPSAnJ1xuICBpZiAodWNvbnQubGVuZ3RoID4gMSkge1xuICAgIHdvcmRzID0gdWNvbnQuam9pbignKycpXG4gIH0gZWxzZSB7XG4gICAgd29yZHMgPSB1Y29udFswXVxuICB9XG4gIGxldCB1cmwgPSBgaHR0cDovL2FwaS51cmJhbmRpY3Rpb25hcnkuY29tL3YwL2RlZmluZT90ZXJtPSR7d29yZHN9YFxuICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgdHlwZTogJ3VyYmFuJyxcbiAgICBzb3VyY2U6ICdodHRwOi8vd3d3LnVyYmFuZGljdGlvbmFyeS5jb20nLFxuICAgIHVybCxcbiAgfVxuICBodHRwKHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UocmVzcG9uc2UuYm9keSlcbiAgICAgIGNvbnN0IGxpbWl0ID0gY29uZmlnLnVyYmFuLmxpbWl0XG4gICAgICBjb25zdCBsaXN0ID0gYm9keS5saXN0LnNsaWNlKDAsIGxpbWl0KVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGlzdC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbGlzdFtpXVxuICAgICAgICB0aGVtZXMubGFiZWxEb3duKCdEZWZpbml0aW9uJywgdGhlbWUsIHJlc3VsdC5kZWZpbml0aW9uKVxuICAgICAgICB0b2ZpbGVbW2BkZWZpbml0aW9uJHtpfWBdXSA9IHJlc3VsdC5kZWZpbml0aW9uXG4gICAgICB9XG4gICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHNhdmUgdXNlciBjb25maWcsIHNldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZS5cIilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06ICR7ZXJyb3J9YClcbiAgICB9XG4gIH0pXG59XG4iXX0=