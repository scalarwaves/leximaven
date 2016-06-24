'use strict';

var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
var needle = require('needle');
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
  var userConfig = {
    combine: {
      lang: argv.l,
      max: argv.m
    }
  };
  if (config.merge) config = _.merge({}, config, userConfig);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.labelDown('Rhymebrain', theme, null);
  var query = argv.query;
  var task = 'Portmanteaus';
  var prefix = 'http://rhymebrain.com/talk?function=get';
  var uri = '' + prefix + task + '&word=' + query + '&';
  var pcont = [];
  pcont.push('lang=' + config.combine.lang + '&');
  pcont.push('maxResults=' + config.combine.max + '&');
  var rest = pcont.join('');
  var url = '' + uri + rest;
  url = encodeURI(url);
  themes.labelDown('Portmanteaus', theme, null);
  var tofile = { type: 'portmanteau', source: 'http://rhymebrain.com' };
  needle.get(url, function (error, response) {
    if (!error && response.statusCode === 200) {
      var list = response.body;
      for (var i = 0; i <= list.length - 1; i++) {
        var item = list[i];
        themes.labelRight(item.source, theme, item.combined);
        tofile[['source' + i]] = item.source;
        tofile[['portmanteau' + i]] = item.combined;
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
    } else {
      console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL2NvbWJpbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNLFNBQVMsUUFBUSxjQUFSLENBQWY7QUFDQSxJQUFNLFFBQVEsUUFBUSxhQUFSLENBQWQ7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiOztBQUVBLElBQU0sUUFBVyxRQUFRLEdBQVIsQ0FBWSxJQUF2QixxQkFBTjs7QUFFQSxRQUFRLE9BQVIsR0FBa0IsaUJBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUseUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLHlCQUZGO0FBR0osYUFBUyxJQUhMO0FBSUosVUFBTTtBQUpGLEdBbkJVO0FBeUJoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSx1QkFGSDtBQUdILGFBQVMsQ0FITjtBQUlILFVBQU07QUFKSDtBQXpCVyxDQUFsQjtBQWdDQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQU0sYUFBYTtBQUNqQixhQUFTO0FBQ1AsWUFBTSxLQUFLLENBREo7QUFFUCxXQUFLLEtBQUs7QUFGSDtBQURRLEdBQW5CO0FBTUEsTUFBSSxPQUFPLEtBQVgsRUFBa0IsU0FBUyxFQUFFLEtBQUYsQ0FBUSxFQUFSLEVBQVksTUFBWixFQUFvQixVQUFwQixDQUFUO0FBQ2xCLE1BQU0sUUFBUSxPQUFPLFNBQVAsQ0FBaUIsT0FBTyxLQUF4QixDQUFkO0FBQ0EsTUFBSSxPQUFPLE9BQVgsRUFBb0IsT0FBTyxTQUFQLENBQWlCLFlBQWpCLEVBQStCLEtBQS9CLEVBQXNDLElBQXRDO0FBQ3BCLE1BQU0sUUFBUSxLQUFLLEtBQW5CO0FBQ0EsTUFBTSxPQUFPLGNBQWI7QUFDQSxNQUFNLFNBQVMseUNBQWY7QUFDQSxNQUFNLFdBQVMsTUFBVCxHQUFrQixJQUFsQixjQUErQixLQUEvQixNQUFOO0FBQ0EsTUFBTSxRQUFRLEVBQWQ7QUFDQSxRQUFNLElBQU4sV0FBbUIsT0FBTyxPQUFQLENBQWUsSUFBbEM7QUFDQSxRQUFNLElBQU4saUJBQXlCLE9BQU8sT0FBUCxDQUFlLEdBQXhDO0FBQ0EsTUFBTSxPQUFPLE1BQU0sSUFBTixDQUFXLEVBQVgsQ0FBYjtBQUNBLE1BQUksV0FBUyxHQUFULEdBQWUsSUFBbkI7QUFDQSxRQUFNLFVBQVUsR0FBVixDQUFOO0FBQ0EsU0FBTyxTQUFQLENBQWlCLGNBQWpCLEVBQWlDLEtBQWpDLEVBQXdDLElBQXhDO0FBQ0EsTUFBTSxTQUFTLEVBQUUsTUFBTSxhQUFSLEVBQXVCLFFBQVEsdUJBQS9CLEVBQWY7QUFDQSxTQUFPLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLFVBQUMsS0FBRCxFQUFRLFFBQVIsRUFBcUI7QUFDbkMsUUFBSSxDQUFDLEtBQUQsSUFBVSxTQUFTLFVBQVQsS0FBd0IsR0FBdEMsRUFBMkM7QUFDekMsVUFBTSxPQUFPLFNBQVMsSUFBdEI7QUFDQSxXQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLEtBQUssS0FBSyxNQUFMLEdBQWMsQ0FBbkMsRUFBc0MsR0FBdEMsRUFBMkM7QUFDekMsWUFBTSxPQUFPLEtBQUssQ0FBTCxDQUFiO0FBQ0EsZUFBTyxVQUFQLENBQWtCLEtBQUssTUFBdkIsRUFBK0IsS0FBL0IsRUFBc0MsS0FBSyxRQUEzQztBQUNBLGVBQU8sWUFBVSxDQUFWLENBQVAsSUFBeUIsS0FBSyxNQUE5QjtBQUNBLGVBQU8saUJBQWUsQ0FBZixDQUFQLElBQThCLEtBQUssUUFBbkM7QUFDRDtBQUNELFVBQUksS0FBSyxDQUFULEVBQVksTUFBTSxPQUFOLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCLEVBQThCLE1BQTlCO0FBQ1osVUFBSSxLQUFLLENBQUwsSUFBVSxPQUFPLEtBQXJCLEVBQTRCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDNUIsVUFBSSxLQUFLLENBQUwsSUFBVSxDQUFDLE9BQU8sS0FBdEIsRUFBNkIsUUFBUSxHQUFSLENBQVksTUFBTSxHQUFOLENBQVUsMkJBQVYsQ0FBWjtBQUM5QixLQVhELE1BV087QUFDTCxjQUFRLEtBQVIsQ0FBaUIsTUFBTSxHQUFOLENBQVUsSUFBVixXQUF1QixTQUFTLFVBQWhDLE9BQWpCLFNBQW1FLE1BQU0sR0FBTixDQUFVLEtBQVYsQ0FBbkU7QUFDRDtBQUNGLEdBZkQ7QUFnQkQsQ0F4Q0QiLCJmaWxlIjoiY21kcy9yaHltZWJyYWluX2NtZHMvY29tYmluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG5lZWRsZSA9IHJlcXVpcmUoJ25lZWRsZScpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnY29tYmluZSA8cXVlcnk+J1xuZXhwb3J0cy5kZXNjID0gJ1JoeW1lYnJhaW4gcG9ydG1hbnRlYXVzJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxhbmc6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdJU08gNjM5LTEgbGFuZ3VhZ2UgY29kZScsXG4gICAgZGVmYXVsdDogJ2VuJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgbWF4OiB7XG4gICAgYWxpYXM6ICdtJyxcbiAgICBkZXNjOiAnTWF4IHJlc3VsdHMgdG8gcmV0dXJuJyxcbiAgICBkZWZhdWx0OiA1LFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgY29tYmluZToge1xuICAgICAgbGFuZzogYXJndi5sLFxuICAgICAgbWF4OiBhcmd2Lm0sXG4gICAgfSxcbiAgfVxuICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignUmh5bWVicmFpbicsIHRoZW1lLCBudWxsKVxuICBjb25zdCBxdWVyeSA9IGFyZ3YucXVlcnlcbiAgY29uc3QgdGFzayA9ICdQb3J0bWFudGVhdXMnXG4gIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vcmh5bWVicmFpbi5jb20vdGFsaz9mdW5jdGlvbj1nZXQnXG4gIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3Rhc2t9JndvcmQ9JHtxdWVyeX0mYFxuICBjb25zdCBwY29udCA9IFtdXG4gIHBjb250LnB1c2goYGxhbmc9JHtjb25maWcuY29tYmluZS5sYW5nfSZgKVxuICBwY29udC5wdXNoKGBtYXhSZXN1bHRzPSR7Y29uZmlnLmNvbWJpbmUubWF4fSZgKVxuICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICB0aGVtZXMubGFiZWxEb3duKCdQb3J0bWFudGVhdXMnLCB0aGVtZSwgbnVsbClcbiAgY29uc3QgdG9maWxlID0geyB0eXBlOiAncG9ydG1hbnRlYXUnLCBzb3VyY2U6ICdodHRwOi8vcmh5bWVicmFpbi5jb20nIH1cbiAgbmVlZGxlLmdldCh1cmwsIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgY29uc3QgbGlzdCA9IHJlc3BvbnNlLmJvZHlcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgIHRoZW1lcy5sYWJlbFJpZ2h0KGl0ZW0uc291cmNlLCB0aGVtZSwgaXRlbS5jb21iaW5lZClcbiAgICAgICAgdG9maWxlW1tgc291cmNlJHtpfWBdXSA9IGl0ZW0uc291cmNlXG4gICAgICAgIHRvZmlsZVtbYHBvcnRtYW50ZWF1JHtpfWBdXSA9IGl0ZW0uY29tYmluZWRcbiAgICAgIH1cbiAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLm1lcmdlKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICAgIGlmIChhcmd2LnMgJiYgIWNvbmZpZy5tZXJnZSkgY29uc29sZS5lcnIoY2hhbGsucmVkKCdTZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUhJykpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y2hhbGsucmVkLmJvbGQoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTpgKX0gJHtjaGFsay5yZWQoZXJyb3IpfWApXG4gICAgfVxuICB9KVxufVxuIl19