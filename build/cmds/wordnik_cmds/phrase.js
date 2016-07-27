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
  var proceed = false;
  var stamp = new Date(config.wordnik.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var reset = false;
  if (minutes < 60) {
    config.wordnik.date.remain = config.wordnik.date.remain - 1;
    noon.save(CFILE, config);
  } else if (minutes >= 60) {
    reset = true;
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
        wordnik: {
          phrase: {
            canon: argv.c,
            limit: argv.l,
            weight: argv.w
          }
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
      var tofile = {
        type: 'phrase',
        source: 'http://www.wordnik.com',
        url: url
      };
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
          if (reset) {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour.');
          } else {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
          }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3BocmFzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUseUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHlCQUZEO0FBR0wsYUFBUyxDQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixVQUFRO0FBQ04sV0FBTyxHQUREO0FBRU4sVUFBTSw4QkFGQTtBQUdOLGFBQVMsRUFISDtBQUlOLFVBQU07QUFKQTtBQS9CUSxDQUFsQjtBQXNDQSxRQUFRLE9B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UCxDQUFlLElBQWYsQ0FBb0IsS0FBakU7QUFDRCxXQUZELE1BRU87QUFDTCxvQkFBUSxHQUFSLENBQWUsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFuQyxTQUE2QyxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQWpFLHNEQUFzSCxLQUFLLE9BQTNIO0FBQ0Q7QUFDRixTQWhCRCxNQWdCTztBQUNMLGtCQUFRLEtBQVIsQ0FBaUIsTUFBTSxHQUFOLENBQVUsSUFBVixXQUF1QixTQUFTLFVBQWhDLE9BQWpCLFNBQW1FLE1BQU0sR0FBTixDQUFVLEtBQVYsQ0FBbkU7QUFDRDtBQUNGLE9BcEJEO0FBaENXO0FBcURaLEdBckRELE1BcURPO0FBQ0wsWUFBUSxLQUFSLENBQWMsTUFBTSxHQUFOLDBDQUFnRCxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQXBFLE9BQWQ7QUFDQSxZQUFRLElBQVIsQ0FBYSxDQUFiO0FBQ0Q7QUFDRixDQXBGRCIsImZpbGUiOiJjbWRzL3dvcmRuaWtfY21kcy9waHJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjowICovXG5jb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi8uLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuY29uc3QgbmVlZGxlID0gcmVxdWlyZSgnbmVlZGxlJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdwaHJhc2UgPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1dvcmRuaWsgYmktZ3JhbSBwaHJhc2VzJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIGNhbm9uOiB7XG4gICAgYWxpYXM6ICdjJyxcbiAgICBkZXNjOiAnVXNlIGNhbm9uaWNhbCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICB3ZWlnaHQ6IHtcbiAgICBhbGlhczogJ3cnLFxuICAgIGRlc2M6ICdNaW5pbXVtIHdlaWdodGVkIG11dHVhbCBpbmZvJyxcbiAgICBkZWZhdWx0OiAxMyxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcClcbiAgY29uc3QgbWludXRlcyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBpZiAobWludXRlcyA8IDYwKSB7XG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIGlmIChtaW51dGVzID49IDYwKSB7XG4gICAgcmVzZXQgPSB0cnVlXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLmxpbWl0XG4gICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYFJlc2V0IEFQSSBsaW1pdCB0byAke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5pbnRlcnZhbH0uYCkpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPT09IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgfSBlbHNlIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA8IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHdvcmRuaWs6IHtcbiAgICAgICAgcGhyYXNlOiB7XG4gICAgICAgICAgY2Fub246IGFyZ3YuYyxcbiAgICAgICAgICBsaW1pdDogYXJndi5sLFxuICAgICAgICAgIHdlaWdodDogYXJndi53LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdXb3JkbmlrJywgdGhlbWUsIG51bGwpXG4gICAgY29uc3Qgd29yZCA9IGFyZ3Yud29yZFxuICAgIGNvbnN0IHRhc2sgPSAncGhyYXNlcydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICAgIGNvbnN0IGFwaWtleSA9IHByb2Nlc3MuZW52LldPUkROSUtcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt3b3JkfS8ke3Rhc2t9P2BcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgdXNlQ2Fub25pY2FsPSR7YXJndi5jfSZgKVxuICAgIHBjb250LnB1c2goYGxpbWl0PSR7YXJndi5sfSZgKVxuICAgIHBjb250LnB1c2goYHdsbWk9JHthcmd2Lnd9JmApXG4gICAgcGNvbnQucHVzaChgYXBpX2tleT0ke2FwaWtleX1gKVxuICAgIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICAgIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIHRoZW1lcy5sYWJlbERvd24oJ0JpLWdyYW0gcGhyYXNlcycsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHRvZmlsZSA9IHtcbiAgICAgIHR5cGU6ICdwaHJhc2UnLFxuICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIG5lZWRsZS5nZXQodXJsLCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gcmVzcG9uc2UuYm9keVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsaXN0Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgICAgY29uc29sZS5sb2coYCR7aXRlbS5ncmFtMX0gJHtpdGVtLmdyYW0yfWApXG4gICAgICAgICAgdG9maWxlW1tgYWdyYW0ke2l9YF1dID0gaXRlbS5ncmFtMVxuICAgICAgICAgIHRvZmlsZVtbYGJncmFtJHtpfWBdXSA9IGl0ZW0uZ3JhbTJcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLm1lcmdlKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICAgICAgaWYgKGFyZ3YucyAmJiAhY29uZmlnLm1lcmdlKSBjb25zb2xlLmVycihjaGFsay5yZWQoJ1NldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZSEnKSlcbiAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ci5gKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NvbmZpZy53b3JkbmlrLmRhdGUucmVtYWlufS8ke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIsIHdpbGwgcmVzZXQgaW4gJHs1OSAtIG1pbnV0ZXN9IG1pbnV0ZXMuYClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgJHtjaGFsay5yZWQuYm9sZChgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OmApfSAke2NoYWxrLnJlZChlcnJvcil9YClcbiAgICAgIH1cbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYCkpXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH1cbn1cbiJdfQ==