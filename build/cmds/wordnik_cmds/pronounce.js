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

exports.command = 'pronounce <word>';
exports.desc = 'Wordnik pronunciations';
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
    desc: 'Dictionary: ahd, century, cmu, macmillan, wiktionary, webster, wordnet',
    default: '',
    type: 'string'
  },
  type: {
    alias: 't',
    desc: 'Type: ahd, arpabet, gcide-diacritical, ipa',
    default: '',
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
          pronounce: {
            canon: argv.c,
            dict: argv.d,
            type: argv.t,
            limit: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'pronunciations';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.pronounce.canon + '&');
      if (config.wordnik.pronounce.dict !== '') pcont.push('sourceDictionary=' + config.wordnik.pronounce.dict + '&');
      if (config.wordnik.pronounce.type !== '') pcont.push('typeFormat=' + config.wordnik.pronounce.type + '&');
      pcont.push('limit=' + config.wordnik.pronounce.limit + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      themes.labelDown('Pronunciations', theme, null);
      var tofile = {
        type: 'pronunciation',
        source: 'http://www.wordnik.com',
        url: url
      };
      tofile.word = word;
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = JSON.parse(response.body);
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            themes.labelRight(word, theme, item.raw + ' - Type - ' + item.rawType);
            tofile[['pronunciation' + i]] = item.raw;
            tofile[['type' + i]] = item.rawType;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3Byb25vdW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGtCQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHdCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSx5QkFGRDtBQUdMLGFBQVMsQ0FISjtBQUlMLFVBQU07QUFKRCxHQW5CUztBQXlCaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sZUFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQXpCUztBQStCaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sd0VBRkY7QUFHSixhQUFTLEVBSEw7QUFJSixVQUFNO0FBSkYsR0EvQlU7QUFxQ2hCLFFBQU07QUFD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bWF4LWxlbjowICovXG5jb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi8uLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2dvb2QtZ3V5LWh0dHAnKSgpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAncHJvbm91bmNlIDx3b3JkPidcbmV4cG9ydHMuZGVzYyA9ICdXb3JkbmlrIHByb251bmNpYXRpb25zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIGNhbm9uOiB7XG4gICAgYWxpYXM6ICdjJyxcbiAgICBkZXNjOiAnVXNlIGNhbm9uaWNhbCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBkaWN0OiB7XG4gICAgYWxpYXM6ICdkJyxcbiAgICBkZXNjOiAnRGljdGlvbmFyeTogYWhkLCBjZW50dXJ5LCBjbXUsIG1hY21pbGxhbiwgd2lrdGlvbmFyeSwgd2Vic3Rlciwgd29yZG5ldCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIHR5cGU6IHtcbiAgICBhbGlhczogJ3QnLFxuICAgIGRlc2M6ICdUeXBlOiBhaGQsIGFycGFiZXQsIGdjaWRlLWRpYWNyaXRpY2FsLCBpcGEnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGxldCBwcm9jZWVkID0gZmFsc2VcbiAgY29uc3Qgc3RhbXAgPSBuZXcgRGF0ZShjb25maWcud29yZG5pay5kYXRlLnN0YW1wKVxuICBjb25zdCBtaW51dGVzID0gbW9tZW50KG5ldyBEYXRlKS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGlmIChtaW51dGVzIDwgNjApIHtcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKG1pbnV0ZXMgPj0gNjApIHtcbiAgICByZXNldCA9IHRydWVcbiAgICBjb25maWcud29yZG5pay5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0vJHtjb25maWcud29yZG5pay5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgd29yZG5pazoge1xuICAgICAgICBwcm9ub3VuY2U6IHtcbiAgICAgICAgICBjYW5vbjogYXJndi5jLFxuICAgICAgICAgIGRpY3Q6IGFyZ3YuZCxcbiAgICAgICAgICB0eXBlOiBhcmd2LnQsXG4gICAgICAgICAgbGltaXQ6IGFyZ3YubCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICAgIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignV29yZG5paycsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgICBjb25zdCB0YXNrID0gJ3Byb251bmNpYXRpb25zJ1xuICAgIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi8nXG4gICAgY29uc3QgYXBpa2V5ID0gcHJvY2Vzcy5lbnYuV09SRE5JS1xuICAgIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3dvcmR9LyR7dGFza30/YFxuICAgIGNvbnN0IHBjb250ID0gW11cbiAgICBwY29udC5wdXNoKGB1c2VDYW5vbmljYWw9JHtjb25maWcud29yZG5pay5wcm9ub3VuY2UuY2Fub259JmApXG4gICAgaWYgKGNvbmZpZy53b3JkbmlrLnByb25vdW5jZS5kaWN0ICE9PSAnJykgcGNvbnQucHVzaChgc291cmNlRGljdGlvbmFyeT0ke2NvbmZpZy53b3JkbmlrLnByb25vdW5jZS5kaWN0fSZgKVxuICAgIGlmIChjb25maWcud29yZG5pay5wcm9ub3VuY2UudHlwZSAhPT0gJycpIHBjb250LnB1c2goYHR5cGVGb3JtYXQ9JHtjb25maWcud29yZG5pay5wcm9ub3VuY2UudHlwZX0mYClcbiAgICBwY29udC5wdXNoKGBsaW1pdD0ke2NvbmZpZy53b3JkbmlrLnByb25vdW5jZS5saW1pdH0mYClcbiAgICBwY29udC5wdXNoKGBhcGlfa2V5PSR7YXBpa2V5fWApXG4gICAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gICAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgdGhlbWVzLmxhYmVsRG93bignUHJvbnVuY2lhdGlvbnMnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgICB0eXBlOiAncHJvbnVuY2lhdGlvbicsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgIHVybCxcbiAgICB9XG4gICAgdG9maWxlLndvcmQgPSB3b3JkXG4gICAgaHR0cCh7IHVybCB9LCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsaXN0Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQod29yZCwgdGhlbWUsIGAke2l0ZW0ucmF3fSAtIFR5cGUgLSAke2l0ZW0ucmF3VHlwZX1gKVxuICAgICAgICAgIHRvZmlsZVtbYHByb251bmNpYXRpb24ke2l9YF1dID0gaXRlbS5yYXdcbiAgICAgICAgICB0b2ZpbGVbW2B0eXBlJHtpfWBdXSA9IGl0ZW0ucmF3VHlwZVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYFJlYWNoZWQgdGhpcyBob3VyJ3MgdXNhZ2UgbGltaXQgb2YgJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fS5gKSlcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxufVxuIl19