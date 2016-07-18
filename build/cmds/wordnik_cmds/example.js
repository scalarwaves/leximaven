'use strict';

/* eslint max-len:0 */
var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
var moment = require('moment');
var needle = require('needle');
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'example <word>';
exports.desc = 'Wordnik examples';
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
  skip: {
    alias: 'k',
    desc: 'Number of results to skip',
    default: 0,
    type: 'number'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var stamp = new Date(config.wordnik.date.stamp);
  var now = new Date();
  var diff = moment(now).diff(stamp, 'minutes');
  var reset = 60 - diff;
  if (diff < 60) {
    config.wordnik.date.remain = config.wordnik.date.remain - 1;
    noon.save(CFILE, config);
  } else if (diff >= 60) {
    config.wordnik.date.stamp = moment().format();
    config.wordnik.date.remain = config.wordnik.date.limit;
    console.log(chalk.white('Reset API limit to ' + config.wordnik.date.limit + '/' + config.wordnik.date.interval + '.'));
    config.wordnik.date.remain = config.wordnik.date.remain - 1;
    noon.save(CFILE, config);
  }
  if (config.wordnik.date.remain === 0) {
    proceed = false;
  } else if (config.wordnik.date.remain < 0) {
    proceed = false;
    config.wordnik.date.remain = 0;
    noon.save(CFILE, config);
  } else {
    proceed = true;
  }
  if (proceed) {
    (function () {
      var userConfig = {
        example: {
          canon: argv.c,
          limit: argv.l,
          skip: argv.k
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'examples';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.example.canon + '&');
      pcont.push('includeDuplicates=false&');
      pcont.push('limit=' + config.wordnik.example.limit + '&');
      if (!config.wordnik.example.skip) {
        pcont.push('skip=0&');
      } else {
        pcont.push('skip=' + config.wordnik.example.skip + '&');
      }
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      var tofile = { type: 'example', source: 'http://www.wordnik.com' };
      needle.get(url, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = response.body.examples;
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            themes.labelRight('Example', theme, item.text);
            tofile[['example' + i]] = item.text;
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (argv.s && config.merge) noon.save(CFILE, config);
          if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
          console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + reset + ' minutes.');
        } else {
          console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
        }
      });
    })();
  } else {
    console.error(chalk.red('Reached this hour\'s usage limit of ' + config.wordnik.date.limit + '.'));
    process.exit(1);
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL2V4YW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixnQkFBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxrQkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0seUJBRkQ7QUFHTCxhQUFTLENBSEo7QUFJTCxVQUFNO0FBSkQsR0FuQlM7QUF5QmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLGVBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0F6QlM7QUErQmhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxDQUhMO0FBSUosVUFBTTtBQUpGO0FBL0JVLENBQWxCO0FBc0NBLFFBQVEs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LENBQVo7QUFDN0Isa0JBQVEsR0FBUixDQUFlLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBbkMsU0FBNkMsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFqRSxxREFBc0gsS0FBdEg7QUFDRCxTQVhELE1BV087QUFDTCxrQkFBUSxLQUFSLENBQWlCLE1BQU0sR0FBTixDQUFVLElBQVYsV0FBdUIsU0FBUyxVQUFoQyxPQUFqQixTQUFtRSxNQUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixPQWZEO0FBOUJXO0FBOENaLEdBOUNELE1BOENPO0FBQ0wsWUFBUSxLQUFSLENBQWMsTUFBTSxHQUFOLDBDQUFnRCxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQXBFLE9BQWQ7QUFDQSxZQUFRLElBQVIsQ0FBYSxDQUFiO0FBQ0Q7QUFDRixDQTdFRCIsImZpbGUiOiJjbWRzL3dvcmRuaWtfY21kcy9leGFtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcbmNvbnN0IG5lZWRsZSA9IHJlcXVpcmUoJ25lZWRsZScpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnZXhhbXBsZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnV29yZG5payBleGFtcGxlcydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsaW1pdDoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0xpbWl0IG51bWJlciBvZiByZXN1bHRzJyxcbiAgICBkZWZhdWx0OiA1LFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBjYW5vbjoge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJ1VzZSBjYW5vbmljYWwnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2tpcDoge1xuICAgIGFsaWFzOiAnaycsXG4gICAgZGVzYzogJ051bWJlciBvZiByZXN1bHRzIHRvIHNraXAnLFxuICAgIGRlZmF1bHQ6IDAsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXApXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlXG4gIGNvbnN0IGRpZmYgPSBtb21lbnQobm93KS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGNvbnN0IHJlc2V0ID0gNjAgLSBkaWZmXG4gIGlmIChkaWZmIDwgNjApIHtcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKGRpZmYgPj0gNjApIHtcbiAgICBjb25maWcud29yZG5pay5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0vJHtjb25maWcud29yZG5pay5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgZXhhbXBsZToge1xuICAgICAgICBjYW5vbjogYXJndi5jLFxuICAgICAgICBsaW1pdDogYXJndi5sLFxuICAgICAgICBza2lwOiBhcmd2LmssXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdleGFtcGxlcydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICAgIGNvbnN0IGFwaWtleSA9IHByb2Nlc3MuZW52LldPUkROSUtcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt3b3JkfS8ke3Rhc2t9P2BcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgdXNlQ2Fub25pY2FsPSR7Y29uZmlnLndvcmRuaWsuZXhhbXBsZS5jYW5vbn0mYClcbiAgICBwY29udC5wdXNoKCdpbmNsdWRlRHVwbGljYXRlcz1mYWxzZSYnKVxuICAgIHBjb250LnB1c2goYGxpbWl0PSR7Y29uZmlnLndvcmRuaWsuZXhhbXBsZS5saW1pdH0mYClcbiAgICBpZiAoIWNvbmZpZy53b3JkbmlrLmV4YW1wbGUuc2tpcCkge1xuICAgICAgcGNvbnQucHVzaCgnc2tpcD0wJicpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBjb250LnB1c2goYHNraXA9JHtjb25maWcud29yZG5pay5leGFtcGxlLnNraXB9JmApXG4gICAgfVxuICAgIHBjb250LnB1c2goYGFwaV9rZXk9JHthcGlrZXl9YClcbiAgICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgICBsZXQgdXJsID0gYCR7dXJpfSR7cmVzdH1gXG4gICAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgICBjb25zdCB0b2ZpbGUgPSB7IHR5cGU6ICdleGFtcGxlJywgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScgfVxuICAgIG5lZWRsZS5nZXQodXJsLCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gcmVzcG9uc2UuYm9keS5leGFtcGxlc1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsaXN0Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ0V4YW1wbGUnLCB0aGVtZSwgaXRlbS50ZXh0KVxuICAgICAgICAgIHRvZmlsZVtbYGV4YW1wbGUke2l9YF1dID0gaXRlbS50ZXh0XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3YubykgdG9vbHMub3V0RmlsZShhcmd2Lm8sIGFyZ3YuZiwgdG9maWxlKVxuICAgICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgIWNvbmZpZy5tZXJnZSkgY29uc29sZS5lcnIoY2hhbGsucmVkKCdTZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUhJykpXG4gICAgICAgIGNvbnNvbGUubG9nKGAke2NvbmZpZy53b3JkbmlrLmRhdGUucmVtYWlufS8ke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIsIHdpbGwgcmVzZXQgaW4gJHtyZXNldH0gbWludXRlcy5gKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgJHtjaGFsay5yZWQuYm9sZChgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OmApfSAke2NoYWxrLnJlZChlcnJvcil9YClcbiAgICAgIH1cbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYCkpXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH1cbn1cbiJdfQ==