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
  var reset = false;
  var stamp = new Date(config.wordnik.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var checkStamp = tools.limitWordnik(config);
  config = checkStamp[0];
  proceed = checkStamp[1];
  reset = checkStamp[2];
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
      if (config.verbose) themes.label(theme, 'down', 'Wordnik');
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
          var hcont = [];
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            if (item.type === 'stress') {
              hcont.push('' + chalk.red.bold(item.text));
              tofile[['stress' + i]] = item.text;
            } else if (item.type === 'secondary stress') {
              hcont.push(ctstyle(item.text));
              tofile[['secondary' + i]] = item.text;
            } else {
              hcont.push(ctstyle(item.text));
              tofile[['syllable' + i]] = item.text;
            }
            if (i < list.length - 1) {
              hcont.push(ctstyle('-'));
            }
          }
          themes.label(theme, 'right', 'Hyphenation', hcont.join(''));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL2h5cGhlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUsc0JBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHlCQUZEO0FBR0wsYUFBUyxDQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSw4REFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRjtBQS9CVSxDQUFsQjtBQXNDQSxRQUFRLE9B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QUFDTCxnQkFBTSxJQUFJLEtBQUosV0FBa0IsU0FBUyxVQUEzQixVQUEwQyxLQUExQyxDQUFOO0FBQ0Q7QUFDRixPQWhDRDtBQWhDVztBQWlFWixHQWpFRCxNQWlFTztBQUNMLFVBQU0sSUFBSSxLQUFKLDBDQUFnRCxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQXBFLE9BQU47QUFDRDtBQUNGLENBL0VEIiwiZmlsZSI6ImNtZHMvd29yZG5pa19jbWRzL2h5cGhlbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnZ29vZC1ndXktaHR0cCcpKClcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdoeXBoZW4gPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1dvcmRuaWsgaHlwaGVuYXRpb25zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIGNhbm9uOiB7XG4gICAgYWxpYXM6ICdjJyxcbiAgICBkZXNjOiAnVXNlIGNhbm9uaWNhbCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBkaWN0OiB7XG4gICAgYWxpYXM6ICdkJyxcbiAgICBkZXNjOiAnU291cmNlIGRpY3Rpb25hcnkgYWhkLCBjZW50dXJ5LCB3aWt0aW9uYXJ5LCB3ZWJzdGVyLCB3b3JkbmV0JyxcbiAgICBkZWZhdWx0OiAnYWxsJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcClcbiAgY29uc3QgbWludXRlcyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBjb25zdCBjaGVja1N0YW1wID0gdG9vbHMubGltaXRXb3JkbmlrKGNvbmZpZylcbiAgY29uZmlnID0gY2hlY2tTdGFtcFswXVxuICBwcm9jZWVkID0gY2hlY2tTdGFtcFsxXVxuICByZXNldCA9IGNoZWNrU3RhbXBbMl1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgd29yZG5pazoge1xuICAgICAgICBoeXBoZW46IHtcbiAgICAgICAgICBjYW5vbjogYXJndi5jLFxuICAgICAgICAgIGRpY3Q6IGFyZ3YuZCxcbiAgICAgICAgICBsaW1pdDogYXJndi5sLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWwodGhlbWUsICdkb3duJywgJ1dvcmRuaWsnKVxuICAgIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgICBjb25zdCB0YXNrID0gJ2h5cGhlbmF0aW9uJ1xuICAgIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi8nXG4gICAgY29uc3QgYXBpa2V5ID0gcHJvY2Vzcy5lbnYuV09SRE5JS1xuICAgIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3dvcmR9LyR7dGFza30/YFxuICAgIGNvbnN0IHBjb250ID0gW11cbiAgICBwY29udC5wdXNoKGB1c2VDYW5vbmljYWw9JHtjb25maWcud29yZG5pay5oeXBoZW4uY2Fub259JmApXG4gICAgaWYgKGFyZ3YuZCAhPT0gJ2FsbCcpIHBjb250LnB1c2goYHNvdXJjZURpY3Rpb25hcnk9JHtjb25maWcud29yZG5pay5oeXBoZW4uZGljdH0mYClcbiAgICBwY29udC5wdXNoKGBsaW1pdD0ke2NvbmZpZy53b3JkbmlrLmh5cGhlbi5saW1pdH0mYClcbiAgICBwY29udC5wdXNoKGBhcGlfa2V5PSR7YXBpa2V5fWApXG4gICAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gICAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ2h5cGhlbmF0aW9uJyxcbiAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cud29yZG5pay5jb20nLFxuICAgICAgdXJsLFxuICAgIH1cbiAgICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gICAgaHR0cCh7IHVybCB9LCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KVxuICAgICAgICBjb25zdCBoY29udCA9IFtdXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnc3RyZXNzJykge1xuICAgICAgICAgICAgaGNvbnQucHVzaChgJHtjaGFsay5yZWQuYm9sZChpdGVtLnRleHQpfWApXG4gICAgICAgICAgICB0b2ZpbGVbW2BzdHJlc3Mke2l9YF1dID0gaXRlbS50ZXh0XG4gICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICdzZWNvbmRhcnkgc3RyZXNzJykge1xuICAgICAgICAgICAgaGNvbnQucHVzaChjdHN0eWxlKGl0ZW0udGV4dCkpXG4gICAgICAgICAgICB0b2ZpbGVbW2BzZWNvbmRhcnkke2l9YF1dID0gaXRlbS50ZXh0XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhjb250LnB1c2goY3RzdHlsZShpdGVtLnRleHQpKVxuICAgICAgICAgICAgdG9maWxlW1tgc3lsbGFibGUke2l9YF1dID0gaXRlbS50ZXh0XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpIDwgbGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBoY29udC5wdXNoKGN0c3R5bGUoJy0nKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhlbWVzLmxhYmVsKHRoZW1lLCAncmlnaHQnLCAnSHlwaGVuYXRpb24nLCBoY29udC5qb2luKCcnKSlcbiAgICAgICAgaWYgKGFyZ3YubykgdG9vbHMub3V0RmlsZShhcmd2Lm8sIGFyZ3YuZiwgdG9maWxlKVxuICAgICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgIWNvbmZpZy5tZXJnZSkgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc2F2ZSB1c2VyIGNvbmZpZywgc2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlLlwiKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNvbmZpZy51c2FnZSkgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTogJHtlcnJvcn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYClcbiAgfVxufVxuIl19