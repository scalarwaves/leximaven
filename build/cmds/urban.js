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
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
    } else {
      throw new Error('HTTP ' + response.statusCode + ': ' + error);
    }
  });
};
//# sourceMappingURL=data:application/json;base64,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QyxFQUEyQztBQUN6QyxZQUFNLFNBQVMsS0FBSyxDQUFMLENBQWY7QUFDQSxlQUFPLEtBQVAsQ0FBYSxLQUFiLEVBQW9CLE1BQXBCLEVBQTRCLFlBQTVCLEVBQTBDLE9BQU8sVUFBakQ7QUFDQSxlQUFPLGdCQUFjLENBQWQsQ0FBUCxJQUE2QixPQUFPLFVBQXBDO0FBQ0Q7QUFDRCxVQUFJLEtBQUssQ0FBVCxFQUFZLE1BQU0sT0FBTixDQUFjLEtBQUssQ0FBbkIsRUFBc0IsS0FBSyxDQUEzQixFQUE4QixNQUE5QjtBQUNaLFVBQUksS0FBSyxDQUFMLElBQVUsT0FBTyxLQUFyQixFQUE0QixLQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO0FBQzVCLFVBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLE1BQU0sSUFBSSxLQUFKLENBQVUsbURBQVYsQ0FBTjtBQUM5QixLQVpELE1BWU87QUFDTCxZQUFNLElBQUksS0FBSixXQUFrQixTQUFTLFVBQTNCLFVBQTBDLEtBQTFDLENBQU47QUFDRDtBQUNGLEdBaEJEO0FBaUJELENBaEREIiwiZmlsZSI6ImNtZHMvdXJiYW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjowICovXG5jb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2dvb2QtZ3V5LWh0dHAnKSgpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAndXJiYW4gPHF1ZXJ5PidcbmV4cG9ydHMuZGVzYyA9ICdVcmJhbiBEaWN0aW9uYXJ5IGRlZmluaXRpb25zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICB1cmJhbjoge1xuICAgICAgbGltaXQ6IGFyZ3YubCxcbiAgICB9LFxuICB9XG4gIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWwodGhlbWUsICdkb3duJywgJ1VyYmFuIERpY3Rpb25hcnknKVxuICBjb25zdCB1Y29udCA9IFtdXG4gIHVjb250LnB1c2goYXJndi5xdWVyeSlcbiAgaWYgKGFyZ3YuXy5sZW5ndGggPiAxKSB7XG4gICAgXy5lYWNoKGFyZ3YuXywgKHZhbHVlKSA9PiB7XG4gICAgICBpZiAodmFsdWUgIT09ICd1cmJhbicpIHVjb250LnB1c2godmFsdWUpXG4gICAgfSlcbiAgfVxuICBsZXQgd29yZHMgPSAnJ1xuICBpZiAodWNvbnQubGVuZ3RoID4gMSkge1xuICAgIHdvcmRzID0gdWNvbnQuam9pbignKycpXG4gIH0gZWxzZSB7XG4gICAgd29yZHMgPSB1Y29udFswXVxuICB9XG4gIGxldCB1cmwgPSBgaHR0cDovL2FwaS51cmJhbmRpY3Rpb25hcnkuY29tL3YwL2RlZmluZT90ZXJtPSR7d29yZHN9YFxuICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgdHlwZTogJ3VyYmFuJyxcbiAgICBzb3VyY2U6ICdodHRwOi8vd3d3LnVyYmFuZGljdGlvbmFyeS5jb20nLFxuICAgIHVybCxcbiAgfVxuICBodHRwKHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UocmVzcG9uc2UuYm9keSlcbiAgICAgIGNvbnN0IGxpbWl0ID0gY29uZmlnLnVyYmFuLmxpbWl0XG4gICAgICBjb25zdCBsaXN0ID0gYm9keS5saXN0LnNsaWNlKDAsIGxpbWl0KVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGlzdC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbGlzdFtpXVxuICAgICAgICB0aGVtZXMubGFiZWwodGhlbWUsICdkb3duJywgJ0RlZmluaXRpb24nLCByZXN1bHQuZGVmaW5pdGlvbilcbiAgICAgICAgdG9maWxlW1tgZGVmaW5pdGlvbiR7aX1gXV0gPSByZXN1bHQuZGVmaW5pdGlvblxuICAgICAgfVxuICAgICAgaWYgKGFyZ3YubykgdG9vbHMub3V0RmlsZShhcmd2Lm8sIGFyZ3YuZiwgdG9maWxlKVxuICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgaWYgKGFyZ3YucyAmJiAhY29uZmlnLm1lcmdlKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBzYXZlIHVzZXIgY29uZmlnLCBzZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUuXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OiAke2Vycm9yfWApXG4gICAgfVxuICB9KVxufVxuIl19