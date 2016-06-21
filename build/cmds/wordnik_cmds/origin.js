'use strict';

var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
var needle = require('needle');
var noon = require('noon');
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'origin <word>';
exports.desc = 'Wordnik etymologies';
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
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var userConfig = {
    origin: {
      canon: argv.c
    }
  };
  if (config.prefer) config = _.merge({}, config, userConfig);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.labelDown('Wordnik', theme, null);
  var word = argv.word;
  var task = 'etymologies';
  var prefix = 'http://api.wordnik.com:80/v4/word.json/';
  var apikey = process.env.WORDNIK;
  var uri = '' + prefix + word + '/' + task + '?';
  var pcont = [];
  pcont.push('useCanonical=' + argv.c + '&');
  pcont.push('api_key=' + apikey);
  var rest = pcont.join('');
  var url = '' + uri + rest;
  url = encodeURI(url);
  var parser = new xml2js.Parser();
  var tofile = { type: 'etymology', source: 'http://www.wordnik.com' };
  var ctstyle = _.get(chalk, theme.content.style);
  needle.get(url, function (error, response) {
    if (!error && response.statusCode === 200) {
      var resp = response.body;
      var origin = resp[0];
      parser.parseString(origin, function (err, result) {
        var root = result.ety;
        var content = root._;
        var ets = root.ets;
        ets = ets.join(', ');
        themes.labelRight('Etymology', theme, ctstyle(content + ' ' + ets));
        tofile.etymology = content;
        tofile.source = ets;
      });
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
      if (argv.s && config.prefer) noon.save(CFILE, config);
    } else {
      console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL29yaWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixlQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHFCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpEO0FBbkJTLENBQWxCO0FBMEJBLFFBQVEsT0FBUixHQUFrQixVQUFDLElBQUQsRUFBVTtBQUMxQixRQUFNLFdBQU4sQ0FBa0IsS0FBbEI7QUFDQSxNQUFJLFNBQVMsS0FBSyxJQUFMLENBQVUsS0FBVixDQUFiO0FBQ0EsTUFBTSxhQUFhO0FBQ2pCLFlBQVE7QUFDTixhQUFPLEtBQUs7QUFETjtBQURTLEdBQW5CO0FBS0EsTUFBSSxPQUFPLE1BQVgsRUFBbUIsU0FBUyxFQUFFLEtBQUYsQ0FBUSxFQUFSLEVBQVksTUFBWixFQUFvQixVQUFwQixDQUFUO0FBQ25CLE1BQU0sUUFBUSxPQUFPLFNBQVAsQ0FBaUIsT0FBTyxLQUF4QixDQUFkO0FBQ0EsTUFBSSxPQUFPLE9BQVgsRUFBb0IsT0FBTyxTQUFQLENBQWlCLFNBQWpCLEVBQTRCLEtBQTVCLEVBQW1DLElBQW5DO0FBQ3BCLE1BQU0sT0FBTyxLQUFLLElBQWxCO0FBQ0EsTUFBTSxPQUFPLGFBQWI7QUFDQSxNQUFNLFNBQVMseUNBQWY7QUFDQSxNQUFNLFNBQVMsUUFBUSxHQUFSLENBQVksT0FBM0I7QUFDQSxNQUFNLFdBQVMsTUFBVCxHQUFrQixJQUFsQixTQUEwQixJQUExQixNQUFOO0FBQ0EsTUFBTSxRQUFRLEVBQWQ7QUFDQSxRQUFNLElBQU4sbUJBQTJCLEtBQUssQ0FBaEM7QUFDQSxRQUFNLElBQU4sY0FBc0IsTUFBdEI7QUFDQSxNQUFNLE9BQU8sTUFBTSxJQUFOLENBQVcsRUFBWCxDQUFiO0FBQ0EsTUFBSSxXQUFTLEdBQVQsR0FBZSxJQUFuQjtBQUNBLFFBQU0sVUFBVSxHQUFWLENBQU47QUFDQSxNQUFNLFNBQVMsSUFBSSxPQUFPLE1BQVgsRUFBZjtBQUNBLE1BQU0sU0FBUyxFQUFFLE1BQU0sV0FBUixFQUFxQixRQUFRLHdCQUE3QixFQUFmO0FBQ0EsTUFBTSxVQUFVLEVBQUUsR0FBRixDQUFNLEtBQU4sRUFBYSxNQUFNLE9BQU4sQ0FBYyxLQUEzQixDQUFoQjtBQUNBLFNBQU8sR0FBUCxDQUFXLEdBQVgsRUFBZ0IsVUFBQyxLQUFELEVBQVEsUUFBUixFQUFxQjtBQUNuQyxRQUFJLENBQUMsS0FBRCxJQUFVLFNBQVMsVUFBVCxLQUF3QixHQUF0QyxFQUEyQztBQUN6QyxVQUFNLE9BQU8sU0FBUyxJQUF0QjtBQUNBLFVBQU0sU0FBUyxLQUFLLENBQUwsQ0FBZjtBQUNBLGFBQU8sV0FBUCxDQUFtQixNQUFuQixFQUEyQixVQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWlCO0FBQzFDLFlBQU0sT0FBTyxPQUFPLEdBQXBCO0FBQ0EsWUFBTSxVQUFVLEtBQUssQ0FBckI7QUFDQSxZQUFJLE1BQU0sS0FBSyxHQUFmO0FBQ0EsY0FBTSxJQUFJLElBQUosQ0FBUyxJQUFULENBQU47QUFDQSxlQUFPLFVBQVAsQ0FBa0IsV0FBbEIsRUFBK0IsS0FBL0IsRUFBc0MsUUFBVyxPQUFYLFNBQXNCLEdBQXRCLENBQXRDO0FBQ0EsZUFBTyxTQUFQLEdBQW1CLE9BQW5CO0FBQ0EsZUFBTyxNQUFQLEdBQWdCLEdBQWhCO0FBQ0QsT0FSRDtBQVNBLFVBQUksS0FBSyxDQUFULEVBQVksTUFBTSxPQUFOLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCLEVBQThCLE1BQTlCO0FBQ1osVUFBSSxLQUFLLENBQUwsSUFBVSxPQUFPLE1BQXJCLEVBQTZCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDOUIsS0FkRCxNQWNPO0FBQ0wsY0FBUSxLQUFSLENBQWlCLE1BQU0sR0FBTixDQUFVLElBQVYsV0FBdUIsU0FBUyxVQUFoQyxPQUFqQixTQUFtRSxNQUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixHQWxCRDtBQW1CRCxDQTVDRCIsImZpbGUiOiJjbWRzL3dvcmRuaWtfY21kcy9vcmlnaW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi8uLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuY29uc3QgeG1sMmpzID0gcmVxdWlyZSgneG1sMmpzJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdvcmlnaW4gPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1dvcmRuaWsgZXR5bW9sb2dpZXMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgY2Fub246IHtcbiAgICBhbGlhczogJ2MnLFxuICAgIGRlc2M6ICdVc2UgY2Fub25pY2FsJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICBvcmlnaW46IHtcbiAgICAgIGNhbm9uOiBhcmd2LmMsXG4gICAgfSxcbiAgfVxuICBpZiAoY29uZmlnLnByZWZlcikgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgY29uc3Qgd29yZCA9IGFyZ3Yud29yZFxuICBjb25zdCB0YXNrID0gJ2V0eW1vbG9naWVzJ1xuICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICBjb25zdCBhcGlrZXkgPSBwcm9jZXNzLmVudi5XT1JETklLXG4gIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3dvcmR9LyR7dGFza30/YFxuICBjb25zdCBwY29udCA9IFtdXG4gIHBjb250LnB1c2goYHVzZUNhbm9uaWNhbD0ke2FyZ3YuY30mYClcbiAgcGNvbnQucHVzaChgYXBpX2tleT0ke2FwaWtleX1gKVxuICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICBjb25zdCBwYXJzZXIgPSBuZXcgeG1sMmpzLlBhcnNlcigpXG4gIGNvbnN0IHRvZmlsZSA9IHsgdHlwZTogJ2V0eW1vbG9neScsIHNvdXJjZTogJ2h0dHA6Ly93d3cud29yZG5pay5jb20nIH1cbiAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICBuZWVkbGUuZ2V0KHVybCwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICBjb25zdCByZXNwID0gcmVzcG9uc2UuYm9keVxuICAgICAgY29uc3Qgb3JpZ2luID0gcmVzcFswXVxuICAgICAgcGFyc2VyLnBhcnNlU3RyaW5nKG9yaWdpbiwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJvb3QgPSByZXN1bHQuZXR5XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSByb290Ll9cbiAgICAgICAgbGV0IGV0cyA9IHJvb3QuZXRzXG4gICAgICAgIGV0cyA9IGV0cy5qb2luKCcsICcpXG4gICAgICAgIHRoZW1lcy5sYWJlbFJpZ2h0KCdFdHltb2xvZ3knLCB0aGVtZSwgY3RzdHlsZShgJHtjb250ZW50fSAke2V0c31gKSlcbiAgICAgICAgdG9maWxlLmV0eW1vbG9neSA9IGNvbnRlbnRcbiAgICAgICAgdG9maWxlLnNvdXJjZSA9IGV0c1xuICAgICAgfSlcbiAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLnByZWZlcikgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y2hhbGsucmVkLmJvbGQoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTpgKX0gJHtjaGFsay5yZWQoZXJyb3IpfWApXG4gICAgfVxuICB9KVxufVxuIl19