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
  var reset = false;
  var stamp = new Date(config.rbrain.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var checkStamp = tools.limitRbrain(config);
  config = checkStamp[0];
  proceed = checkStamp[1];
  reset = checkStamp[2];
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
      if (config.verbose) themes.label(theme, 'down', 'Rhymebrain');
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
            themes.label(theme, 'right', task, rcont.join(', '));
            if (argv.o) tools.outFile(argv.o, argv.f, tofile);
            if (argv.s && config.merge) noon.save(CFILE, config);
            if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
            if (reset) {
              console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.');
            } else {
              if (config.usage) console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQSxJQUFNLFNBQVMsUUFBUSxjQUFSLENBQWY7QUFDQSxJQUFNLFFBQVEsUUFBUSxhQUFSLENBQWQ7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxPQUFPLFFBQVEsZUFBUixHQUFiO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiOztBQUVBLElBQU0sUUFBVyxRQUFRLEdBQVIsQ0FBWSxJQUF2QixxQkFBTjs7QUFFQSxRQUFRLE9BQVIsR0FBa0IsY0FBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxtQkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0seUJBRkY7QUFHSixhQUFTLElBSEw7QUFJSixVQUFNO0FBSkYsR0FuQlU7QUF5QmhCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLHVCQUZIO0FBR0gsYUFBUyxDQUhOO0FBSUgsVUFBTTtBQUpIO0FBekJXLENBQWxCO0FBZ0NBLFFBQVEsT0FBUixHQUFrQixVQUFDLElBQUQsRUFBVTtBQUMxQixRQUFNLFdBQU4sQ0FBa0IsS0FBbEI7QUFDQSxNQUFJLFNBQVMsS0FBSyxJQUFM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QUFULENBQVAsSUFBd0IsSUFBeEI7QUFDRDtBQUNGO0FBQ0Qsa0JBQU0sSUFBTjtBQUNBLG1CQUFPLEtBQVAsQ0FBYSxLQUFiLEVBQW9CLE9BQXBCLEVBQTZCLElBQTdCLEVBQW1DLE1BQU0sSUFBTixDQUFXLElBQVgsQ0FBbkM7QUFDQSxnQkFBSSxLQUFLLENBQVQsRUFBWSxNQUFNLE9BQU4sQ0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDWixnQkFBSSxLQUFLLENBQUwsSUFBVSxPQUFPLEtBQXJCLEVBQTRCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDNUIsZ0JBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLE1BQU0sSUFBSSxLQUFKLENBQVUsbURBQVYsQ0FBTjtBQUM3QixnQkFBSSxLQUFKLEVBQVc7QUFDVCxzQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9EO0FBQ0QsYUFGRCxNQUVPO0FBQ0wsa0JBQUksT0FBTyxLQUFYLEVBQWtCLFFBQVEsR0FBUixDQUFlLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbEMsU0FBNEMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUEvRCxzREFBb0gsS0FBSyxPQUF6SDtBQUNuQjtBQTlCd0M7QUErQjFDLFNBL0JELE1BK0JPO0FBQ0wsZ0JBQU0sSUFBSSxLQUFKLFdBQWtCLFNBQVMsVUFBM0IsVUFBMEMsS0FBMUMsQ0FBTjtBQUNEO0FBQ0YsT0FuQ0Q7QUE1Qlc7QUFnRVosR0FoRUQsTUFnRU87QUFDTCxVQUFNLElBQUksS0FBSiwwQ0FBZ0QsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUFuRSxPQUFOO0FBQ0Q7QUFDRixDQTlFRCIsImZpbGUiOiJjbWRzL3JoeW1lYnJhaW5fY21kcy9yaHltZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnZ29vZC1ndXktaHR0cCcpKClcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdyaHltZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnUmh5bWVicmFpbiByaHltZXMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGFuZzoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0lTTyA2MzktMSBsYW5ndWFnZSBjb2RlJyxcbiAgICBkZWZhdWx0OiAnZW4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBtYXg6IHtcbiAgICBhbGlhczogJ20nLFxuICAgIGRlc2M6ICdNYXggcmVzdWx0cyB0byByZXR1cm4nLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcClcbiAgY29uc3QgbWludXRlcyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBjb25zdCBjaGVja1N0YW1wID0gdG9vbHMubGltaXRSYnJhaW4oY29uZmlnKVxuICBjb25maWcgPSBjaGVja1N0YW1wWzBdXG4gIHByb2NlZWQgPSBjaGVja1N0YW1wWzFdXG4gIHJlc2V0ID0gY2hlY2tTdGFtcFsyXVxuICBpZiAocHJvY2VlZCkge1xuICAgIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgICByYnJhaW46IHtcbiAgICAgICAgcmh5bWU6IHtcbiAgICAgICAgICBsYW5nOiBhcmd2LmwsXG4gICAgICAgICAgbWF4OiBhcmd2Lm0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbCh0aGVtZSwgJ2Rvd24nLCAnUmh5bWVicmFpbicpXG4gICAgY29uc3Qgd29yZCA9IGFyZ3Yud29yZFxuICAgIGNvbnN0IHRhc2sgPSAnUmh5bWVzJ1xuICAgIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vcmh5bWVicmFpbi5jb20vdGFsaz9mdW5jdGlvbj1nZXQnXG4gICAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7dGFza30md29yZD0ke3dvcmR9JmBcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgbGFuZz0ke2NvbmZpZy5yYnJhaW4ucmh5bWUubGFuZ30mYClcbiAgICBwY29udC5wdXNoKGBtYXhSZXN1bHRzPSR7Y29uZmlnLnJicmFpbi5yaHltZS5tYXh9JmApXG4gICAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gICAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ3JoeW1lJyxcbiAgICAgIHNvdXJjZTogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgICBodHRwKHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpXG4gICAgICAgIGNvbnN0IGxjb250ID0gW11cbiAgICAgICAgXy5lYWNoKGxpc3QsIChpdGVtKSA9PiB7XG4gICAgICAgICAgbGNvbnQucHVzaChpdGVtLndvcmQpXG4gICAgICAgIH0pXG4gICAgICAgIGxjb250LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICBpZiAoYSA8IGIpIHJldHVybiAtMVxuICAgICAgICAgIGlmIChhID4gYikgcmV0dXJuIDFcbiAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9KVxuICAgICAgICBjb25zdCByY29udCA9IFtdXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IGxjb250Lmxlbmd0aCAtIDE7IGorKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsY29udFtqXVxuICAgICAgICAgIHJjb250LnB1c2goY3RzdHlsZShpdGVtKSlcbiAgICAgICAgICBpZiAoaXRlbS5zY29yZSA+PSAzMDApIHtcbiAgICAgICAgICAgIHRvZmlsZVtbYGhpc2NvcmUke2p9YF1dID0gaXRlbVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b2ZpbGVbW2ByaHltZSR7an1gXV0gPSBpdGVtXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJjb250LnNvcnQoKVxuICAgICAgICB0aGVtZXMubGFiZWwodGhlbWUsICdyaWdodCcsIHRhc2ssIHJjb250LmpvaW4oJywgJykpXG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHNhdmUgdXNlciBjb25maWcsIHNldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZS5cIilcbiAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbn0vJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29uZmlnLnVzYWdlKSBjb25zb2xlLmxvZyhgJHtjb25maWcucmJyYWluLmRhdGUucmVtYWlufS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTogJHtlcnJvcn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fS5gKVxuICB9XG59XG4iXX0=