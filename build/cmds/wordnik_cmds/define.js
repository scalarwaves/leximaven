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

exports.command = 'define <word>';
exports.desc = 'Wordnik definitions';
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
  defdict: {
    alias: 'd',
    desc: "CSV list of dictionaries or 'all'",
    default: 'all',
    type: 'string'
  },
  part: {
    alias: 'p',
    desc: 'CSV list of parts of speech. See http://developer.wordnik.com/docs.html for list of parts.',
    default: '',
    type: 'string'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var stamp = new Date(config.wordnik.date.stamp);
  var now = moment(new Date()).diff(stamp, 'minutes');
  var diff = 60 - now;
  var reset = false;
  if (diff < 60) {
    config.wordnik.date.remain = config.wordnik.date.remain - 1;
    noon.save(CFILE, config);
  } else if (diff >= 60) {
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
          define: {
            canon: argv.c,
            limit: argv.l,
            defdict: argv.d,
            part: argv.p
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'definitions';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.define.canon + '&');
      pcont.push('sourceDictionaries=' + config.wordnik.define.defdict + '&');
      pcont.push('includeRelated=false&');
      pcont.push('includeTags=false&');
      pcont.push('limit=' + config.wordnik.define.limit + '&');
      pcont.push('partOfSpeech=' + config.wordnik.define.part + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      var tofile = {
        type: 'definition',
        source: 'http://www.wordnik.com',
        url: url
      };
      var cstyle = _.get(chalk, theme.connector.style);
      var ctstyle = _.get(chalk, theme.content.style);
      var uline = _.get(chalk, theme.content.style + '.underline');
      var conn = cstyle(theme.connector.str);
      needle.get(url, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = response.body;
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            var icont = [];
            icont.push(ctstyle(item.text + ' '));
            icont.push(uline(item.partOfSpeech));
            icont.push(conn);
            icont.push(ctstyle(item.sourceDictionary));
            themes.labelRight('Definition', theme, icont.join(''));
            tofile[['text' + i]] = item.text;
            tofile[['deftype' + i]] = item.partOfSpeech;
            tofile[['source' + i]] = item.sourceDictionary;
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (argv.s && config.merge) noon.save(CFILE, config);
          if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
          if (reset) {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour.');
          } else {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + diff + ' minutes.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL2RlZmluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUscUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHlCQUZEO0FBR0wsYUFBUyxDQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixXQUFTO0FBQ1AsV0FBTyxHQURBO0FBRVAsVUFBTSxtQ0FGQztBQUdQLGFBQVMsS0FIRjtBQUlQLFVBQU07QUFKQyxHQS9CTztBQXFDaEIsUUFBTTtBQUNKLFdB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QkFBUSxLQUFSLENBQWlCLE1BQU0sR0FBTixDQUFVLElBQVYsV0FBdUIsU0FBUyxVQUFoQyxPQUFqQixTQUFtRSxNQUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixPQTFCRDtBQXZDVztBQWtFWixHQWxFRCxNQWtFTztBQUNMLFlBQVEsS0FBUixDQUFjLE1BQU0sR0FBTiwwQ0FBZ0QsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFwRSxPQUFkO0FBQ0EsWUFBUSxJQUFSLENBQWEsQ0FBYjtBQUNEO0FBQ0YsQ0FsR0QiLCJmaWxlIjoiY21kcy93b3JkbmlrX2NtZHMvZGVmaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcbmNvbnN0IG5lZWRsZSA9IHJlcXVpcmUoJ25lZWRsZScpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnZGVmaW5lIDx3b3JkPidcbmV4cG9ydHMuZGVzYyA9ICdXb3JkbmlrIGRlZmluaXRpb25zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIGNhbm9uOiB7XG4gICAgYWxpYXM6ICdjJyxcbiAgICBkZXNjOiAnVXNlIGNhbm9uaWNhbCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBkZWZkaWN0OiB7XG4gICAgYWxpYXM6ICdkJyxcbiAgICBkZXNjOiBcIkNTViBsaXN0IG9mIGRpY3Rpb25hcmllcyBvciAnYWxsJ1wiLFxuICAgIGRlZmF1bHQ6ICdhbGwnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBwYXJ0OiB7XG4gICAgYWxpYXM6ICdwJyxcbiAgICBkZXNjOiAnQ1NWIGxpc3Qgb2YgcGFydHMgb2Ygc3BlZWNoLiBTZWUgaHR0cDovL2RldmVsb3Blci53b3JkbmlrLmNvbS9kb2NzLmh0bWwgZm9yIGxpc3Qgb2YgcGFydHMuJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcClcbiAgY29uc3Qgbm93ID0gbW9tZW50KG5ldyBEYXRlKS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGNvbnN0IGRpZmYgPSA2MCAtIG5vd1xuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBpZiAoZGlmZiA8IDYwKSB7XG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIGlmIChkaWZmID49IDYwKSB7XG4gICAgcmVzZXQgPSB0cnVlXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLmxpbWl0XG4gICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYFJlc2V0IEFQSSBsaW1pdCB0byAke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5pbnRlcnZhbH0uYCkpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPT09IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgfSBlbHNlIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA8IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHdvcmRuaWs6IHtcbiAgICAgICAgZGVmaW5lOiB7XG4gICAgICAgICAgY2Fub246IGFyZ3YuYyxcbiAgICAgICAgICBsaW1pdDogYXJndi5sLFxuICAgICAgICAgIGRlZmRpY3Q6IGFyZ3YuZCxcbiAgICAgICAgICBwYXJ0OiBhcmd2LnAsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdkZWZpbml0aW9ucydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICAgIGNvbnN0IGFwaWtleSA9IHByb2Nlc3MuZW52LldPUkROSUtcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt3b3JkfS8ke3Rhc2t9P2BcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgdXNlQ2Fub25pY2FsPSR7Y29uZmlnLndvcmRuaWsuZGVmaW5lLmNhbm9ufSZgKVxuICAgIHBjb250LnB1c2goYHNvdXJjZURpY3Rpb25hcmllcz0ke2NvbmZpZy53b3JkbmlrLmRlZmluZS5kZWZkaWN0fSZgKVxuICAgIHBjb250LnB1c2goJ2luY2x1ZGVSZWxhdGVkPWZhbHNlJicpXG4gICAgcGNvbnQucHVzaCgnaW5jbHVkZVRhZ3M9ZmFsc2UmJylcbiAgICBwY29udC5wdXNoKGBsaW1pdD0ke2NvbmZpZy53b3JkbmlrLmRlZmluZS5saW1pdH0mYClcbiAgICBwY29udC5wdXNoKGBwYXJ0T2ZTcGVlY2g9JHtjb25maWcud29yZG5pay5kZWZpbmUucGFydH0mYClcbiAgICBwY29udC5wdXNoKGBhcGlfa2V5PSR7YXBpa2V5fWApXG4gICAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gICAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ2RlZmluaXRpb24nLFxuICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGNzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb25uZWN0b3Iuc3R5bGUpXG4gICAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICAgIGNvbnN0IHVsaW5lID0gXy5nZXQoY2hhbGssIGAke3RoZW1lLmNvbnRlbnQuc3R5bGV9LnVuZGVybGluZWApXG4gICAgY29uc3QgY29ubiA9IGNzdHlsZSh0aGVtZS5jb25uZWN0b3Iuc3RyKVxuICAgIG5lZWRsZS5nZXQodXJsLCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gcmVzcG9uc2UuYm9keVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsaXN0Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgICAgY29uc3QgaWNvbnQgPSBbXVxuICAgICAgICAgIGljb250LnB1c2goY3RzdHlsZShgJHtpdGVtLnRleHR9IGApKVxuICAgICAgICAgIGljb250LnB1c2godWxpbmUoaXRlbS5wYXJ0T2ZTcGVlY2gpKVxuICAgICAgICAgIGljb250LnB1c2goY29ubilcbiAgICAgICAgICBpY29udC5wdXNoKGN0c3R5bGUoaXRlbS5zb3VyY2VEaWN0aW9uYXJ5KSlcbiAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnRGVmaW5pdGlvbicsIHRoZW1lLCBpY29udC5qb2luKCcnKSlcbiAgICAgICAgICB0b2ZpbGVbW2B0ZXh0JHtpfWBdXSA9IGl0ZW0udGV4dFxuICAgICAgICAgIHRvZmlsZVtbYGRlZnR5cGUke2l9YF1dID0gaXRlbS5wYXJ0T2ZTcGVlY2hcbiAgICAgICAgICB0b2ZpbGVbW2Bzb3VyY2Uke2l9YF1dID0gaXRlbS5zb3VyY2VEaWN0aW9uYXJ5XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3YubykgdG9vbHMub3V0RmlsZShhcmd2Lm8sIGFyZ3YuZiwgdG9maWxlKVxuICAgICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgIWNvbmZpZy5tZXJnZSkgY29uc29sZS5lcnIoY2hhbGsucmVkKCdTZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUhJykpXG4gICAgICAgIGlmIChyZXNldCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NvbmZpZy53b3JkbmlrLmRhdGUucmVtYWlufS8ke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLCB3aWxsIHJlc2V0IGluICR7ZGlmZn0gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYFJlYWNoZWQgdGhpcyBob3VyJ3MgdXNhZ2UgbGltaXQgb2YgJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fS5gKSlcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxufVxuIl19