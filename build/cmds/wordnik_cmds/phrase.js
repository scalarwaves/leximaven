'use strict';

var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
var needle = require('needle');
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
  var userConfig = {
    phrase: {
      canon: argv.c,
      limit: argv.l,
      weight: argv.w
    }
  };
  if (config.merge) config = _.merge({}, config, userConfig);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.labelDown('Wordnik', theme, null);
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
  themes.labelDown('Bi-gram phrases', theme, null);
  var tofile = { type: 'phrase', source: 'http://www.wordnik.com' };
  needle.get(url, function (error, response) {
    if (!error && response.statusCode === 200) {
      var list = response.body;
      for (var i = 0; i <= list.length - 1; i++) {
        var item = list[i];
        console.log(item.gram1 + ' ' + item.gram2);
        tofile[['agram' + i]] = item.gram1;
        tofile[['bgram' + i]] = item.gram2;
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
    } else {
      console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3BocmFzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixlQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHlCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSx5QkFGRDtBQUdMLGFBQVMsQ0FISjtBQUlMLFVBQU07QUFKRCxHQW5CUztBQXlCaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sZUFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQXpCUztBQStCaEIsVUFBUTtBQUNOLFdBQU8sR0FERDtBQUVOLFVBQU0sOEJBRkE7QUFHTixhQUFTLEVBSEg7QUFJTixVQUFNO0FBSkE7QUEvQlEsQ0FBbEI7QUFzQ0EsUUFBUSxPQUFSLEdBQWtCLFVBQUMsSUFBRCxFQUFVO0FBQzFCLFFBQU0sV0FBTixDQUFrQixLQUFsQjtBQUNBLE1BQUksU0FBUyxLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWI7QUFDQSxNQUFNLGFBQWE7QUFDakIsWUFBUTtBQUNOLGFBQU8sS0FBSyxDQUROO0FBRU4sYUFBTyxLQUFLLENBRk47QUFHTixjQUFRLEtBQUs7QUFIUDtBQURTLEdBQW5CO0FBT0EsTUFBSSxPQUFPLEtBQVgsRUFBa0IsU0FBUyxFQUFFLEtBQUYsQ0FBUSxFQUFSLEVBQVksTUFBWixFQUFvQixVQUFwQixDQUFUO0FBQ2xCLE1BQU0sUUFBUSxPQUFPLFNBQVAsQ0FBaUIsT0FBTyxLQUF4QixDQUFkO0FBQ0EsTUFBSSxPQUFPLE9BQVgsRUFBb0IsT0FBTyxTQUFQLENBQWlCLFNBQWpCLEVBQTRCLEtBQTVCLEVBQW1DLElBQW5DO0FBQ3BCLE1BQU0sT0FBTyxLQUFLLElBQWxCO0FBQ0EsTUFBTSxPQUFPLFNBQWI7QUFDQSxNQUFNLFNBQVMseUNBQWY7QUFDQSxNQUFNLFNBQVMsUUFBUSxHQUFSLENBQVksT0FBM0I7QUFDQSxNQUFNLFdBQVMsTUFBVCxHQUFrQixJQUFsQixTQUEwQixJQUExQixNQUFOO0FBQ0EsTUFBTSxRQUFRLEVBQWQ7QUFDQSxRQUFNLElBQU4sbUJBQTJCLEtBQUssQ0FBaEM7QUFDQSxRQUFNLElBQU4sWUFBb0IsS0FBSyxDQUF6QjtBQUNBLFFBQU0sSUFBTixXQUFtQixLQUFLLENBQXhCO0FBQ0EsUUFBTSxJQUFOLGNBQXNCLE1BQXRCO0FBQ0EsTUFBTSxPQUFPLE1BQU0sSUFBTixDQUFXLEVBQVgsQ0FBYjtBQUNBLE1BQUksV0FBUyxHQUFULEdBQWUsSUFBbkI7QUFDQSxRQUFNLFVBQVUsR0FBVixDQUFOO0FBQ0EsU0FBTyxTQUFQLENBQWlCLGlCQUFqQixFQUFvQyxLQUFwQyxFQUEyQyxJQUEzQztBQUNBLE1BQU0sU0FBUyxFQUFFLE1BQU0sUUFBUixFQUFrQixRQUFRLHdCQUExQixFQUFmO0FBQ0EsU0FBTyxHQUFQLENBQVcsR0FBWCxFQUFnQixVQUFDLEtBQUQsRUFBUSxRQUFSLEVBQXFCO0FBQ25DLFFBQUksQ0FBQyxLQUFELElBQVUsU0FBUyxVQUFULEtBQXdCLEdBQXRDLEVBQTJDO0FBQ3pDLFVBQU0sT0FBTyxTQUFTLElBQXRCO0FBQ0EsV0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixLQUFLLEtBQUssTUFBTCxHQUFjLENBQW5DLEVBQXNDLEdBQXRDLEVBQTJDO0FBQ3pDLFlBQU0sT0FBTyxLQUFLLENBQUwsQ0FBYjtBQUNBLGdCQUFRLEdBQVIsQ0FBZSxLQUFLLEtBQXBCLFNBQTZCLEtBQUssS0FBbEM7QUFDQSxlQUFPLFdBQVMsQ0FBVCxDQUFQLElBQXdCLEtBQUssS0FBN0I7QUFDQSxlQUFPLFdBQVMsQ0FBVCxDQUFQLElBQXdCLEtBQUssS0FBN0I7QUFDRDtBQUNELFVBQUksS0FBSyxDQUFULEVBQVksTUFBTSxPQUFOLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCLEVBQThCLE1BQTlCO0FBQ1osVUFBSSxLQUFLLENBQUwsSUFBVSxPQUFPLEtBQXJCLEVBQTRCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDNUIsVUFBSSxLQUFLLENBQUwsSUFBVSxDQUFDLE9BQU8sS0FBdEIsRUFBNkIsUUFBUSxHQUFSLENBQVksTUFBTSxHQUFOLENBQVUsMkJBQVYsQ0FBWjtBQUM5QixLQVhELE1BV087QUFDTCxjQUFRLEtBQVIsQ0FBaUIsTUFBTSxHQUFOLENBQVUsSUFBVixXQUF1QixTQUFTLFVBQWhDLE9BQWpCLFNBQW1FLE1BQU0sR0FBTixDQUFVLEtBQVYsQ0FBbkU7QUFDRDtBQUNGLEdBZkQ7QUFnQkQsQ0E1Q0QiLCJmaWxlIjoiY21kcy93b3JkbmlrX2NtZHMvcGhyYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbmVlZGxlID0gcmVxdWlyZSgnbmVlZGxlJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdwaHJhc2UgPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1dvcmRuaWsgYmktZ3JhbSBwaHJhc2VzJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIGNhbm9uOiB7XG4gICAgYWxpYXM6ICdjJyxcbiAgICBkZXNjOiAnVXNlIGNhbm9uaWNhbCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICB3ZWlnaHQ6IHtcbiAgICBhbGlhczogJ3cnLFxuICAgIGRlc2M6ICdNaW5pbXVtIHdlaWdodGVkIG11dHVhbCBpbmZvJyxcbiAgICBkZWZhdWx0OiAxMyxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgIHBocmFzZToge1xuICAgICAgY2Fub246IGFyZ3YuYyxcbiAgICAgIGxpbWl0OiBhcmd2LmwsXG4gICAgICB3ZWlnaHQ6IGFyZ3YudyxcbiAgICB9LFxuICB9XG4gIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdXb3JkbmlrJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgY29uc3QgdGFzayA9ICdwaHJhc2VzJ1xuICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICBjb25zdCBhcGlrZXkgPSBwcm9jZXNzLmVudi5XT1JETklLXG4gIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3dvcmR9LyR7dGFza30/YFxuICBjb25zdCBwY29udCA9IFtdXG4gIHBjb250LnB1c2goYHVzZUNhbm9uaWNhbD0ke2FyZ3YuY30mYClcbiAgcGNvbnQucHVzaChgbGltaXQ9JHthcmd2Lmx9JmApXG4gIHBjb250LnB1c2goYHdsbWk9JHthcmd2Lnd9JmApXG4gIHBjb250LnB1c2goYGFwaV9rZXk9JHthcGlrZXl9YClcbiAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgdGhlbWVzLmxhYmVsRG93bignQmktZ3JhbSBwaHJhc2VzJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHRvZmlsZSA9IHsgdHlwZTogJ3BocmFzZScsIHNvdXJjZTogJ2h0dHA6Ly93d3cud29yZG5pay5jb20nIH1cbiAgbmVlZGxlLmdldCh1cmwsIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgY29uc3QgbGlzdCA9IHJlc3BvbnNlLmJvZHlcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgIGNvbnNvbGUubG9nKGAke2l0ZW0uZ3JhbTF9ICR7aXRlbS5ncmFtMn1gKVxuICAgICAgICB0b2ZpbGVbW2BhZ3JhbSR7aX1gXV0gPSBpdGVtLmdyYW0xXG4gICAgICAgIHRvZmlsZVtbYGJncmFtJHtpfWBdXSA9IGl0ZW0uZ3JhbTJcbiAgICAgIH1cbiAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLm1lcmdlKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICAgIGlmIChhcmd2LnMgJiYgIWNvbmZpZy5tZXJnZSkgY29uc29sZS5lcnIoY2hhbGsucmVkKCdTZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUhJykpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y2hhbGsucmVkLmJvbGQoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTpgKX0gJHtjaGFsay5yZWQoZXJyb3IpfWApXG4gICAgfVxuICB9KVxufVxuIl19