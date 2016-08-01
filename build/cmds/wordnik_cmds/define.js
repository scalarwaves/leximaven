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
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = JSON.parse(response.body);
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
          if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
          if (reset) {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour.');
          } else {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL2RlZmluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUscUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHlCQUZEO0FBR0wsYUFBUyxDQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixXQUFTO0FBQ1AsV0FBTyxHQURBO0FBRVAsVUFBTSxtQ0FGQztBQUdQLGFBQVMsS0FIRjtBQUlQLFVBQU07QUFKQyxHQS9CTztBQXFDaEIsUUFBTTtBQUNKLFdB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LEtBQUosV0FBa0IsU0FBUyxVQUEzQixVQUEwQyxLQUExQyxDQUFOO0FBQ0Q7QUFDRixPQTFCRDtBQXZDVztBQWtFWixHQWxFRCxNQWtFTztBQUNMLFVBQU0sSUFBSSxLQUFKLDBDQUFnRCxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQXBFLE9BQU47QUFDRDtBQUNGLENBaEdEIiwiZmlsZSI6ImNtZHMvd29yZG5pa19jbWRzL2RlZmluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnZ29vZC1ndXktaHR0cCcpKClcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdkZWZpbmUgPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1dvcmRuaWsgZGVmaW5pdGlvbnMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGltaXQ6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdMaW1pdCBudW1iZXIgb2YgcmVzdWx0cycsXG4gICAgZGVmYXVsdDogNSxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgY2Fub246IHtcbiAgICBhbGlhczogJ2MnLFxuICAgIGRlc2M6ICdVc2UgY2Fub25pY2FsJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGRlZmRpY3Q6IHtcbiAgICBhbGlhczogJ2QnLFxuICAgIGRlc2M6IFwiQ1NWIGxpc3Qgb2YgZGljdGlvbmFyaWVzIG9yICdhbGwnXCIsXG4gICAgZGVmYXVsdDogJ2FsbCcsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIHBhcnQ6IHtcbiAgICBhbGlhczogJ3AnLFxuICAgIGRlc2M6ICdDU1YgbGlzdCBvZiBwYXJ0cyBvZiBzcGVlY2guIFNlZSBodHRwOi8vZGV2ZWxvcGVyLndvcmRuaWsuY29tL2RvY3MuaHRtbCBmb3IgbGlzdCBvZiBwYXJ0cy4nLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGxldCBwcm9jZWVkID0gZmFsc2VcbiAgY29uc3Qgc3RhbXAgPSBuZXcgRGF0ZShjb25maWcud29yZG5pay5kYXRlLnN0YW1wKVxuICBjb25zdCBtaW51dGVzID0gbW9tZW50KG5ldyBEYXRlKS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGlmIChtaW51dGVzIDwgNjApIHtcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKG1pbnV0ZXMgPj0gNjApIHtcbiAgICByZXNldCA9IHRydWVcbiAgICBjb25maWcud29yZG5pay5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0vJHtjb25maWcud29yZG5pay5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgd29yZG5pazoge1xuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICBjYW5vbjogYXJndi5jLFxuICAgICAgICAgIGxpbWl0OiBhcmd2LmwsXG4gICAgICAgICAgZGVmZGljdDogYXJndi5kLFxuICAgICAgICAgIHBhcnQ6IGFyZ3YucCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICAgIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignV29yZG5paycsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgICBjb25zdCB0YXNrID0gJ2RlZmluaXRpb25zJ1xuICAgIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi8nXG4gICAgY29uc3QgYXBpa2V5ID0gcHJvY2Vzcy5lbnYuV09SRE5JS1xuICAgIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3dvcmR9LyR7dGFza30/YFxuICAgIGNvbnN0IHBjb250ID0gW11cbiAgICBwY29udC5wdXNoKGB1c2VDYW5vbmljYWw9JHtjb25maWcud29yZG5pay5kZWZpbmUuY2Fub259JmApXG4gICAgcGNvbnQucHVzaChgc291cmNlRGljdGlvbmFyaWVzPSR7Y29uZmlnLndvcmRuaWsuZGVmaW5lLmRlZmRpY3R9JmApXG4gICAgcGNvbnQucHVzaCgnaW5jbHVkZVJlbGF0ZWQ9ZmFsc2UmJylcbiAgICBwY29udC5wdXNoKCdpbmNsdWRlVGFncz1mYWxzZSYnKVxuICAgIHBjb250LnB1c2goYGxpbWl0PSR7Y29uZmlnLndvcmRuaWsuZGVmaW5lLmxpbWl0fSZgKVxuICAgIHBjb250LnB1c2goYHBhcnRPZlNwZWVjaD0ke2NvbmZpZy53b3JkbmlrLmRlZmluZS5wYXJ0fSZgKVxuICAgIHBjb250LnB1c2goYGFwaV9rZXk9JHthcGlrZXl9YClcbiAgICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgICBsZXQgdXJsID0gYCR7dXJpfSR7cmVzdH1gXG4gICAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgICB0eXBlOiAnZGVmaW5pdGlvbicsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgIHVybCxcbiAgICB9XG4gICAgY29uc3QgY3N0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbm5lY3Rvci5zdHlsZSlcbiAgICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gICAgY29uc3QgdWxpbmUgPSBfLmdldChjaGFsaywgYCR7dGhlbWUuY29udGVudC5zdHlsZX0udW5kZXJsaW5lYClcbiAgICBjb25zdCBjb25uID0gY3N0eWxlKHRoZW1lLmNvbm5lY3Rvci5zdHIpXG4gICAgaHR0cCh7IHVybCB9LCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsaXN0Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgICAgY29uc3QgaWNvbnQgPSBbXVxuICAgICAgICAgIGljb250LnB1c2goY3RzdHlsZShgJHtpdGVtLnRleHR9IGApKVxuICAgICAgICAgIGljb250LnB1c2godWxpbmUoaXRlbS5wYXJ0T2ZTcGVlY2gpKVxuICAgICAgICAgIGljb250LnB1c2goY29ubilcbiAgICAgICAgICBpY29udC5wdXNoKGN0c3R5bGUoaXRlbS5zb3VyY2VEaWN0aW9uYXJ5KSlcbiAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnRGVmaW5pdGlvbicsIHRoZW1lLCBpY29udC5qb2luKCcnKSlcbiAgICAgICAgICB0b2ZpbGVbW2B0ZXh0JHtpfWBdXSA9IGl0ZW0udGV4dFxuICAgICAgICAgIHRvZmlsZVtbYGRlZnR5cGUke2l9YF1dID0gaXRlbS5wYXJ0T2ZTcGVlY2hcbiAgICAgICAgICB0b2ZpbGVbW2Bzb3VyY2Uke2l9YF1dID0gaXRlbS5zb3VyY2VEaWN0aW9uYXJ5XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3YubykgdG9vbHMub3V0RmlsZShhcmd2Lm8sIGFyZ3YuZiwgdG9maWxlKVxuICAgICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgIWNvbmZpZy5tZXJnZSkgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc2F2ZSB1c2VyIGNvbmZpZywgc2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlLlwiKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTogJHtlcnJvcn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYClcbiAgfVxufVxuIl19