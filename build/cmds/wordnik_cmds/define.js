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
        define: {
          canon: argv.c,
          limit: argv.l,
          defdict: argv.d,
          part: argv.p
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
      var tofile = { type: 'definition', source: 'http://www.wordnik.com' };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL2RlZmluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUscUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHlCQUZEO0FBR0wsYUFBUyxDQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixXQUFTO0FBQ1AsV0FBTyxHQURBO0FBRVAsVUFBTSxtQ0FGQztBQUdQLGFBQVMsS0FIRjtBQUlQLFVBQU07QUFKQyxHQS9CTztBQXFDaEIsUUFBTTtBQUNKLFdB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T0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBcEUsT0FBZDtBQUNBLFlBQVEsSUFBUixDQUFhLENBQWI7QUFDRDtBQUNGLENBdkZEIiwiZmlsZSI6ImNtZHMvd29yZG5pa19jbWRzL2RlZmluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ2RlZmluZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnV29yZG5payBkZWZpbml0aW9ucydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsaW1pdDoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0xpbWl0IG51bWJlciBvZiByZXN1bHRzJyxcbiAgICBkZWZhdWx0OiA1LFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBjYW5vbjoge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJ1VzZSBjYW5vbmljYWwnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgZGVmZGljdDoge1xuICAgIGFsaWFzOiAnZCcsXG4gICAgZGVzYzogXCJDU1YgbGlzdCBvZiBkaWN0aW9uYXJpZXMgb3IgJ2FsbCdcIixcbiAgICBkZWZhdWx0OiAnYWxsJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgcGFydDoge1xuICAgIGFsaWFzOiAncCcsXG4gICAgZGVzYzogJ0NTViBsaXN0IG9mIHBhcnRzIG9mIHNwZWVjaC4gU2VlIGh0dHA6Ly9kZXZlbG9wZXIud29yZG5pay5jb20vZG9jcy5odG1sIGZvciBsaXN0IG9mIHBhcnRzLicsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXApXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlXG4gIGNvbnN0IGRpZmYgPSBtb21lbnQobm93KS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGNvbnN0IHJlc2V0ID0gNjAgLSBkaWZmXG4gIGlmIChkaWZmIDwgNjApIHtcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKGRpZmYgPj0gNjApIHtcbiAgICBjb25maWcud29yZG5pay5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0vJHtjb25maWcud29yZG5pay5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgZGVmaW5lOiB7XG4gICAgICAgIGNhbm9uOiBhcmd2LmMsXG4gICAgICAgIGxpbWl0OiBhcmd2LmwsXG4gICAgICAgIGRlZmRpY3Q6IGFyZ3YuZCxcbiAgICAgICAgcGFydDogYXJndi5wLFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdXb3JkbmlrJywgdGhlbWUsIG51bGwpXG4gICAgY29uc3Qgd29yZCA9IGFyZ3Yud29yZFxuICAgIGNvbnN0IHRhc2sgPSAnZGVmaW5pdGlvbnMnXG4gICAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly9hcGkud29yZG5pay5jb206ODAvdjQvd29yZC5qc29uLydcbiAgICBjb25zdCBhcGlrZXkgPSBwcm9jZXNzLmVudi5XT1JETklLXG4gICAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7d29yZH0vJHt0YXNrfT9gXG4gICAgY29uc3QgcGNvbnQgPSBbXVxuICAgIHBjb250LnB1c2goYHVzZUNhbm9uaWNhbD0ke2NvbmZpZy53b3JkbmlrLmRlZmluZS5jYW5vbn0mYClcbiAgICBwY29udC5wdXNoKGBzb3VyY2VEaWN0aW9uYXJpZXM9JHtjb25maWcud29yZG5pay5kZWZpbmUuZGVmZGljdH0mYClcbiAgICBwY29udC5wdXNoKCdpbmNsdWRlUmVsYXRlZD1mYWxzZSYnKVxuICAgIHBjb250LnB1c2goJ2luY2x1ZGVUYWdzPWZhbHNlJicpXG4gICAgcGNvbnQucHVzaChgbGltaXQ9JHtjb25maWcud29yZG5pay5kZWZpbmUubGltaXR9JmApXG4gICAgcGNvbnQucHVzaChgcGFydE9mU3BlZWNoPSR7Y29uZmlnLndvcmRuaWsuZGVmaW5lLnBhcnR9JmApXG4gICAgcGNvbnQucHVzaChgYXBpX2tleT0ke2FwaWtleX1gKVxuICAgIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICAgIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIGNvbnN0IHRvZmlsZSA9IHsgdHlwZTogJ2RlZmluaXRpb24nLCBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyB9XG4gICAgY29uc3QgY3N0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbm5lY3Rvci5zdHlsZSlcbiAgICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gICAgY29uc3QgdWxpbmUgPSBfLmdldChjaGFsaywgYCR7dGhlbWUuY29udGVudC5zdHlsZX0udW5kZXJsaW5lYClcbiAgICBjb25zdCBjb25uID0gY3N0eWxlKHRoZW1lLmNvbm5lY3Rvci5zdHIpXG4gICAgbmVlZGxlLmdldCh1cmwsIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSByZXNwb25zZS5ib2R5XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgICBjb25zdCBpY29udCA9IFtdXG4gICAgICAgICAgaWNvbnQucHVzaChjdHN0eWxlKGAke2l0ZW0udGV4dH0gYCkpXG4gICAgICAgICAgaWNvbnQucHVzaCh1bGluZShpdGVtLnBhcnRPZlNwZWVjaCkpXG4gICAgICAgICAgaWNvbnQucHVzaChjb25uKVxuICAgICAgICAgIGljb250LnB1c2goY3RzdHlsZShpdGVtLnNvdXJjZURpY3Rpb25hcnkpKVxuICAgICAgICAgIHRoZW1lcy5sYWJlbFJpZ2h0KCdEZWZpbml0aW9uJywgdGhlbWUsIGljb250LmpvaW4oJycpKVxuICAgICAgICAgIHRvZmlsZVtbYHRleHQke2l9YF1dID0gaXRlbS50ZXh0XG4gICAgICAgICAgdG9maWxlW1tgZGVmdHlwZSR7aX1gXV0gPSBpdGVtLnBhcnRPZlNwZWVjaFxuICAgICAgICAgIHRvZmlsZVtbYHNvdXJjZSR7aX1gXV0gPSBpdGVtLnNvdXJjZURpY3Rpb25hcnlcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLm1lcmdlKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICAgICAgaWYgKGFyZ3YucyAmJiAhY29uZmlnLm1lcmdlKSBjb25zb2xlLmVycihjaGFsay5yZWQoJ1NldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZSEnKSlcbiAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAke3Jlc2V0fSBtaW51dGVzLmApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYFJlYWNoZWQgdGhpcyBob3VyJ3MgdXNhZ2UgbGltaXQgb2YgJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fS5gKSlcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxufVxuIl19