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

exports.command = 'hyphen <word>';
exports.desc = 'Wordnik hyphenations';
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
  dict: {
    alias: 'd',
    desc: 'Source dictionary ahd, century, wiktionary, webster, wordnet',
    default: 'all',
    type: 'string'
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
          hyphen: {
            canon: argv.c,
            dict: argv.d,
            limit: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'hyphenation';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.hyphen.canon + '&');
      if (argv.d !== 'all') pcont.push('sourceDictionary=' + config.wordnik.hyphen.dict + '&');
      pcont.push('limit=' + config.wordnik.hyphen.limit + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      var tofile = {
        type: 'hyphenation',
        source: 'http://www.wordnik.com',
        url: url
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = JSON.parse(response.body);
          themes.labelRight('Hyphenation', theme, null);
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            if (item.type === 'stress') {
              process.stdout.write('' + chalk.red.bold(item.text));
              tofile[['stress' + i]] = item.text;
            } else if (item.type === 'secondary stress') {
              process.stdout.write(ctstyle(item.text));
              tofile[['secondary' + i]] = item.text;
            } else {
              process.stdout.write(ctstyle(item.text));
              tofile[['syllable' + i]] = item.text;
            }
            if (i < list.length - 1) {
              process.stdout.write(ctstyle('-'));
            }
          }
          console.log('');
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (argv.s && config.merge) noon.save(CFILE, config);
          if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
          if (reset) {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour.');
          } else {
            if (config.usage) console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
          }
        } else {
          throw new Error('HTTP ' + response.statusCode + ': ' + error);
        }
      });
    })();
  } else {
    throw new Error('Reached this hour\'s usage limit of ' + config.wordnik.date.limit + '.');
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL2h5cGhlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUsc0JBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHlCQUZEO0FBR0wsYUFBUyxDQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSw4REFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRjtBQS9CVSxDQUFsQjtBQXNDQSxRQUFRLE9B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LENBQWUsSUFBZixDQUFvQixLQUFwRSxPQUFOO0FBQ0Q7QUFDRixDQS9GRCIsImZpbGUiOiJjbWRzL3dvcmRuaWtfY21kcy9oeXBoZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjowICovXG5jb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi8uLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2dvb2QtZ3V5LWh0dHAnKSgpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnaHlwaGVuIDx3b3JkPidcbmV4cG9ydHMuZGVzYyA9ICdXb3JkbmlrIGh5cGhlbmF0aW9ucydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsaW1pdDoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0xpbWl0IG51bWJlciBvZiByZXN1bHRzJyxcbiAgICBkZWZhdWx0OiA1LFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBjYW5vbjoge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJ1VzZSBjYW5vbmljYWwnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgZGljdDoge1xuICAgIGFsaWFzOiAnZCcsXG4gICAgZGVzYzogJ1NvdXJjZSBkaWN0aW9uYXJ5IGFoZCwgY2VudHVyeSwgd2lrdGlvbmFyeSwgd2Vic3Rlciwgd29yZG5ldCcsXG4gICAgZGVmYXVsdDogJ2FsbCcsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXApXG4gIGNvbnN0IG1pbnV0ZXMgPSBtb21lbnQobmV3IERhdGUpLmRpZmYoc3RhbXAsICdtaW51dGVzJylcbiAgbGV0IHJlc2V0ID0gZmFsc2VcbiAgaWYgKG1pbnV0ZXMgPCA2MCkge1xuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSBpZiAobWludXRlcyA+PSA2MCkge1xuICAgIHJlc2V0ID0gdHJ1ZVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXAgPSBtb21lbnQoKS5mb3JtYXQoKVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdFxuICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBSZXNldCBBUEkgbGltaXQgdG8gJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fS8ke2NvbmZpZy53b3JkbmlrLmRhdGUuaW50ZXJ2YWx9LmApKVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH1cbiAgaWYgKGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID09PSAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gIH0gZWxzZSBpZiAoY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPCAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSAwXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSB7XG4gICAgcHJvY2VlZCA9IHRydWVcbiAgfVxuICBpZiAocHJvY2VlZCkge1xuICAgIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgICB3b3JkbmlrOiB7XG4gICAgICAgIGh5cGhlbjoge1xuICAgICAgICAgIGNhbm9uOiBhcmd2LmMsXG4gICAgICAgICAgZGljdDogYXJndi5kLFxuICAgICAgICAgIGxpbWl0OiBhcmd2LmwsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdoeXBoZW5hdGlvbidcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICAgIGNvbnN0IGFwaWtleSA9IHByb2Nlc3MuZW52LldPUkROSUtcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt3b3JkfS8ke3Rhc2t9P2BcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgdXNlQ2Fub25pY2FsPSR7Y29uZmlnLndvcmRuaWsuaHlwaGVuLmNhbm9ufSZgKVxuICAgIGlmIChhcmd2LmQgIT09ICdhbGwnKSBwY29udC5wdXNoKGBzb3VyY2VEaWN0aW9uYXJ5PSR7Y29uZmlnLndvcmRuaWsuaHlwaGVuLmRpY3R9JmApXG4gICAgcGNvbnQucHVzaChgbGltaXQ9JHtjb25maWcud29yZG5pay5oeXBoZW4ubGltaXR9JmApXG4gICAgcGNvbnQucHVzaChgYXBpX2tleT0ke2FwaWtleX1gKVxuICAgIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICAgIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIGNvbnN0IHRvZmlsZSA9IHtcbiAgICAgIHR5cGU6ICdoeXBoZW5hdGlvbicsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgIHVybCxcbiAgICB9XG4gICAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICAgIGh0dHAoeyB1cmwgfSwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuYm9keSlcbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ0h5cGhlbmF0aW9uJywgdGhlbWUsIG51bGwpXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnc3RyZXNzJykge1xuICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYCR7Y2hhbGsucmVkLmJvbGQoaXRlbS50ZXh0KX1gKVxuICAgICAgICAgICAgdG9maWxlW1tgc3RyZXNzJHtpfWBdXSA9IGl0ZW0udGV4dFxuICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09PSAnc2Vjb25kYXJ5IHN0cmVzcycpIHtcbiAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGN0c3R5bGUoaXRlbS50ZXh0KSlcbiAgICAgICAgICAgIHRvZmlsZVtbYHNlY29uZGFyeSR7aX1gXV0gPSBpdGVtLnRleHRcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoY3RzdHlsZShpdGVtLnRleHQpKVxuICAgICAgICAgICAgdG9maWxlW1tgc3lsbGFibGUke2l9YF1dID0gaXRlbS50ZXh0XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpIDwgbGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShjdHN0eWxlKCctJykpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCcnKVxuICAgICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLm1lcmdlKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICAgICAgaWYgKGFyZ3YucyAmJiAhY29uZmlnLm1lcmdlKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBzYXZlIHVzZXIgY29uZmlnLCBzZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUuXCIpXG4gICAgICAgIGlmIChyZXNldCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NvbmZpZy53b3JkbmlrLmRhdGUucmVtYWlufS8ke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29uZmlnLnVzYWdlKSBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLCB3aWxsIHJlc2V0IGluICR7NTkgLSBtaW51dGVzfSBtaW51dGVzLmApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OiAke2Vycm9yfWApXG4gICAgICB9XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFJlYWNoZWQgdGhpcyBob3VyJ3MgdXNhZ2UgbGltaXQgb2YgJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fS5gKVxuICB9XG59XG4iXX0=