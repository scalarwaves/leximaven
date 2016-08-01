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

exports.command = 'relate <word>';
exports.desc = 'Wordnik related words';
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
    desc: 'Limit results = require(type option',
    default: 10,
    type: 'number'
  },
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean'
  },
  type: {
    alias: 't',
    desc: 'Relationship types to limit',
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
          relate: {
            canon: argv.c,
            type: argv.t,
            limit: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'relatedWords';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.relate.canon + '&');
      if (config.wordnik.relate.type !== '') {
        pcont.push('relationshipTypes=' + config.wordnik.relate.type + '&');
      }
      pcont.push('limitPerRelationshipType=' + config.wordnik.relate.limit + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      themes.labelDown('Related words', theme, null);
      var tofile = {
        type: 'related words',
        source: 'http://www.wordnik.com',
        url: url
      };
      tofile.word = word;
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = JSON.parse(response.body);
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            themes.labelRight(item.relationshipType, theme, '' + item.words.join(', '));
            tofile[['type' + i]] = item.relationshipType;
            tofile[['words' + i]] = item.words.join(', ');
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
    throw new Error('Reached this hour\'s usage limit of ' + config.wordnik.date.limit + '.');
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3JlbGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUsdUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHFDQUZEO0FBR0wsYUFBUyxFQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSw2QkFGRjtBQUdKLGFBQVMsRUFITDtBQUlKLFVBQU07QUFKRjtBQS9CVSxDQUFsQjtBQXNDQSxRQUFRLE9B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VSxPQUFPLEtBQXJCLEVBQTRCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDNUIsY0FBSSxLQUFLLENBQUwsSUFBVSxDQUFDLE9BQU8sS0FBdEIsRUFBNkIsUUFBUSxHQUFSLENBQVksTUFBTSxHQUFOLENBQVUsMkJBQVYsQ0FBWjtBQUM3QixjQUFJLEtBQUosRUFBVztBQUNULG9CQUFRLEdBQVIsQ0FBZSxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQW5DLFNBQTZDLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBakU7QUFDRCxXQUZELE1BRU87QUFDTCxvQkFBUSxHQUFSLENBQWUsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFuQyxTQUE2QyxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQWpFLHNEQUFzSCxLQUFLLE9BQTNIO0FBQ0Q7QUFDRixTQWhCRCxNQWdCTztBQUNMLGtCQUFRLEtBQVIsQ0FBaUIsTUFBTSxHQUFOLENBQVUsSUFBVixXQUF1QixTQUFTLFVBQWhDLE9BQWpCLFNBQW1FLE1BQU0sR0FBTixDQUFVLEtBQVYsQ0FBbkU7QUFDRDtBQUNGLE9BcEJEO0FBbkNXO0FBd0RaLEdBeERELE1Bd0RPO0FBQ0wsVUFBTSxJQUFJLEtBQUosMENBQWdELE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBcEUsT0FBTjtBQUNEO0FBQ0YsQ0FyRkQiLCJmaWxlIjoiY21kcy93b3JkbmlrX2NtZHMvcmVsYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdnb29kLWd1eS1odHRwJykoKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ3JlbGF0ZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnV29yZG5payByZWxhdGVkIHdvcmRzJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgcmVzdWx0cyA9IHJlcXVpcmUodHlwZSBvcHRpb24nLFxuICAgIGRlZmF1bHQ6IDEwLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBjYW5vbjoge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJ1VzZSBjYW5vbmljYWwnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgdHlwZToge1xuICAgIGFsaWFzOiAndCcsXG4gICAgZGVzYzogJ1JlbGF0aW9uc2hpcCB0eXBlcyB0byBsaW1pdCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXApXG4gIGNvbnN0IG1pbnV0ZXMgPSBtb21lbnQobmV3IERhdGUpLmRpZmYoc3RhbXAsICdtaW51dGVzJylcbiAgY29uc3QgcmVzZXQgPSBmYWxzZVxuICBpZiAobWludXRlcyA8IDYwKSB7XG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIGlmIChtaW51dGVzID49IDYwKSB7XG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLmxpbWl0XG4gICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYFJlc2V0IEFQSSBsaW1pdCB0byAke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5pbnRlcnZhbH0uYCkpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPT09IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgfSBlbHNlIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA8IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHdvcmRuaWs6IHtcbiAgICAgICAgcmVsYXRlOiB7XG4gICAgICAgICAgY2Fub246IGFyZ3YuYyxcbiAgICAgICAgICB0eXBlOiBhcmd2LnQsXG4gICAgICAgICAgbGltaXQ6IGFyZ3YubCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICAgIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignV29yZG5paycsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgICBjb25zdCB0YXNrID0gJ3JlbGF0ZWRXb3JkcydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICAgIGNvbnN0IGFwaWtleSA9IHByb2Nlc3MuZW52LldPUkROSUtcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt3b3JkfS8ke3Rhc2t9P2BcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgdXNlQ2Fub25pY2FsPSR7Y29uZmlnLndvcmRuaWsucmVsYXRlLmNhbm9ufSZgKVxuICAgIGlmIChjb25maWcud29yZG5pay5yZWxhdGUudHlwZSAhPT0gJycpIHtcbiAgICAgIHBjb250LnB1c2goYHJlbGF0aW9uc2hpcFR5cGVzPSR7Y29uZmlnLndvcmRuaWsucmVsYXRlLnR5cGV9JmApXG4gICAgfVxuICAgIHBjb250LnB1c2goYGxpbWl0UGVyUmVsYXRpb25zaGlwVHlwZT0ke2NvbmZpZy53b3JkbmlrLnJlbGF0ZS5saW1pdH0mYClcbiAgICBwY29udC5wdXNoKGBhcGlfa2V5PSR7YXBpa2V5fWApXG4gICAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gICAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgdGhlbWVzLmxhYmVsRG93bignUmVsYXRlZCB3b3JkcycsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHRvZmlsZSA9IHtcbiAgICAgIHR5cGU6ICdyZWxhdGVkIHdvcmRzJyxcbiAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cud29yZG5pay5jb20nLFxuICAgICAgdXJsLFxuICAgIH1cbiAgICB0b2ZpbGUud29yZCA9IHdvcmRcbiAgICBodHRwKHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodChpdGVtLnJlbGF0aW9uc2hpcFR5cGUsIHRoZW1lLCBgJHtpdGVtLndvcmRzLmpvaW4oJywgJyl9YClcbiAgICAgICAgICB0b2ZpbGVbW2B0eXBlJHtpfWBdXSA9IGl0ZW0ucmVsYXRpb25zaGlwVHlwZVxuICAgICAgICAgIHRvZmlsZVtbYHdvcmRzJHtpfWBdXSA9IGl0ZW0ud29yZHMuam9pbignLCAnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYClcbiAgfVxufVxuIl19