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

exports.command = 'rhyme <word>';
exports.desc = 'Rhymebrain rhymes';
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
  lang: {
    alias: 'l',
    desc: 'ISO 639-1 language code',
    default: 'en',
    type: 'string'
  },
  max: {
    alias: 'm',
    desc: 'Max results to return',
    default: 5,
    type: 'number'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var stamp = new Date(config.rbrain.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var reset = false;
  if (minutes < 60) {
    config.rbrain.date.remain = config.rbrain.date.remain - 1;
    noon.save(CFILE, config);
  } else if (minutes >= 60) {
    reset = true;
    config.rbrain.date.stamp = moment().format();
    config.rbrain.date.remain = config.rbrain.date.limit;
    console.log(chalk.white('Reset API limit to ' + config.rbrain.date.limit + '/' + config.rbrain.date.interval + '.'));
    config.rbrain.date.remain = config.rbrain.date.remain - 1;
    noon.save(CFILE, config);
  }
  if (config.rbrain.date.remain === 0) {
    proceed = false;
  } else if (config.rbrain.date.remain < 0) {
    proceed = false;
    config.rbrain.date.remain = 0;
    noon.save(CFILE, config);
  } else {
    proceed = true;
  }
  if (proceed) {
    (function () {
      var userConfig = {
        rbrain: {
          rhyme: {
            lang: argv.l,
            max: argv.m
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Rhymebrain', theme, null);
      var word = argv.word;
      var task = 'Rhymes';
      var prefix = 'http://rhymebrain.com/talk?function=get';
      var uri = '' + prefix + task + '&word=' + word + '&';
      var pcont = [];
      pcont.push('lang=' + config.rbrain.rhyme.lang + '&');
      pcont.push('maxResults=' + config.rbrain.rhyme.max + '&');
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      var tofile = {
        type: 'rhyme',
        source: 'http://rhymebrain.com',
        url: url
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          (function () {
            var list = JSON.parse(response.body);
            var lcont = [];
            _.each(list, function (item) {
              lcont.push(item.word);
            });
            lcont.sort(function (a, b) {
              if (a < b) return -1;
              if (a > b) return 1;
              return 0;
            });
            var rcont = [];
            for (var j = 0; j <= lcont.length - 1; j++) {
              var item = lcont[j];
              rcont.push(ctstyle(item));
              if (item.score >= 300) {
                tofile[['hiscore' + j]] = item;
              } else {
                tofile[['rhyme' + j]] = item;
              }
            }
            rcont.sort();
            themes.labelRight('Rhymes', theme, rcont.join(', '));
            if (argv.o) tools.outFile(argv.o, argv.f, tofile);
            if (argv.s && config.merge) noon.save(CFILE, config);
            if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
            if (reset) {
              console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.');
            } else {
              console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
            }
          })();
        } else {
          throw new Error('HTTP ' + response.statusCode + ': ' + error);
        }
      });
    })();
  } else {
    throw new Error('Reached this hour\'s usage limit of ' + config.rbrain.date.limit + '.');
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQSxJQUFNLFNBQVMsUUFBUSxjQUFSLENBQWY7QUFDQSxJQUFNLFFBQVEsUUFBUSxhQUFSLENBQWQ7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxPQUFPLFFBQVEsZUFBUixHQUFiO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiOztBQUVBLElBQU0sUUFBVyxRQUFRLEdBQVIsQ0FBWSxJQUF2QixxQkFBTjs7QUFFQSxRQUFRLE9BQVIsR0FBa0IsY0FBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxtQkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0seUJBRkY7QUFHSixhQUFTLElBSEw7QUFJSixVQUFNO0FBSkYsR0FuQlU7QUF5QmhCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLHVCQUZIO0FBR0gsYUFBUyxDQUhOO0FBSUgsVUFBTTtBQUpIO0FBekJXLENBQWxCO0FBZ0NBLFFBQVEsT0FBUixHQUFrQixVQUFDLElBQUQsRUFBVTtBQUMxQixRQUFNLFdBQU4sQ0FBa0IsS0FBbEI7QUFDQSxNQUFJLFNBQVMsS0FBSyxJQUFM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Q0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDWixnQkFBSSxLQUFLLENBQUwsSUFBVSxPQUFPLEtBQXJCLEVBQTRCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDNUIsZ0JBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLE1BQU0sSUFBSSxLQUFKLENBQVUsbURBQVYsQ0FBTjtBQUM3QixnQkFBSSxLQUFKLEVBQVc7QUFDVCxzQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9EO0FBQ0QsYUFGRCxNQUVPO0FBQ0wsc0JBQVEsR0FBUixDQUFlLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbEMsU0FBNEMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUEvRCxzREFBb0gsS0FBSyxPQUF6SDtBQUNEO0FBOUJ3QztBQStCMUMsU0EvQkQsTUErQk87QUFDTCxnQkFBTSxJQUFJLEtBQUosV0FBa0IsU0FBUyxVQUEzQixVQUEwQyxLQUExQyxDQUFOO0FBQ0Q7QUFDRixPQW5DRDtBQTVCVztBQWdFWixHQWhFRCxNQWdFTztBQUNMLFVBQU0sSUFBSSxLQUFKLDBDQUFnRCxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQW5FLE9BQU47QUFDRDtBQUNGLENBOUZEIiwiZmlsZSI6ImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdnb29kLWd1eS1odHRwJykoKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ3JoeW1lIDx3b3JkPidcbmV4cG9ydHMuZGVzYyA9ICdSaHltZWJyYWluIHJoeW1lcydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsYW5nOiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnSVNPIDYzOS0xIGxhbmd1YWdlIGNvZGUnLFxuICAgIGRlZmF1bHQ6ICdlbicsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIG1heDoge1xuICAgIGFsaWFzOiAnbScsXG4gICAgZGVzYzogJ01heCByZXN1bHRzIHRvIHJldHVybicsXG4gICAgZGVmYXVsdDogNSxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wKVxuICBjb25zdCBtaW51dGVzID0gbW9tZW50KG5ldyBEYXRlKS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGlmIChtaW51dGVzIDwgNjApIHtcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIGlmIChtaW51dGVzID49IDYwKSB7XG4gICAgcmVzZXQgPSB0cnVlXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLmxpbWl0XG4gICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYFJlc2V0IEFQSSBsaW1pdCB0byAke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0vJHtjb25maWcucmJyYWluLmRhdGUuaW50ZXJ2YWx9LmApKVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSBjb25maWcucmJyYWluLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcucmJyYWluLmRhdGUucmVtYWluID09PSAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gIH0gZWxzZSBpZiAoY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA8IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgcmJyYWluOiB7XG4gICAgICAgIHJoeW1lOiB7XG4gICAgICAgICAgbGFuZzogYXJndi5sLFxuICAgICAgICAgIG1heDogYXJndi5tLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdSaHltZWJyYWluJywgdGhlbWUsIG51bGwpXG4gICAgY29uc3Qgd29yZCA9IGFyZ3Yud29yZFxuICAgIGNvbnN0IHRhc2sgPSAnUmh5bWVzJ1xuICAgIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vcmh5bWVicmFpbi5jb20vdGFsaz9mdW5jdGlvbj1nZXQnXG4gICAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7dGFza30md29yZD0ke3dvcmR9JmBcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgbGFuZz0ke2NvbmZpZy5yYnJhaW4ucmh5bWUubGFuZ30mYClcbiAgICBwY29udC5wdXNoKGBtYXhSZXN1bHRzPSR7Y29uZmlnLnJicmFpbi5yaHltZS5tYXh9JmApXG4gICAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gICAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ3JoeW1lJyxcbiAgICAgIHNvdXJjZTogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgICBodHRwKHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpXG4gICAgICAgIGNvbnN0IGxjb250ID0gW11cbiAgICAgICAgXy5lYWNoKGxpc3QsIChpdGVtKSA9PiB7XG4gICAgICAgICAgbGNvbnQucHVzaChpdGVtLndvcmQpXG4gICAgICAgIH0pXG4gICAgICAgIGxjb250LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICBpZiAoYSA8IGIpIHJldHVybiAtMVxuICAgICAgICAgIGlmIChhID4gYikgcmV0dXJuIDFcbiAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9KVxuICAgICAgICBjb25zdCByY29udCA9IFtdXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IGxjb250Lmxlbmd0aCAtIDE7IGorKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsY29udFtqXVxuICAgICAgICAgIHJjb250LnB1c2goY3RzdHlsZShpdGVtKSlcbiAgICAgICAgICBpZiAoaXRlbS5zY29yZSA+PSAzMDApIHtcbiAgICAgICAgICAgIHRvZmlsZVtbYGhpc2NvcmUke2p9YF1dID0gaXRlbVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b2ZpbGVbW2ByaHltZSR7an1gXV0gPSBpdGVtXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJjb250LnNvcnQoKVxuICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnUmh5bWVzJywgdGhlbWUsIHJjb250LmpvaW4oJywgJykpXG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHNhdmUgdXNlciBjb25maWcsIHNldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZS5cIilcbiAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbn0vJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcucmJyYWluLmRhdGUucmVtYWlufS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTogJHtlcnJvcn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fS5gKVxuICB9XG59XG4iXX0=