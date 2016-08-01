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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQSxJQUFNLFNBQVMsUUFBUSxjQUFSLENBQWY7QUFDQSxJQUFNLFFBQVEsUUFBUSxhQUFSLENBQWQ7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxPQUFPLFFBQVEsZUFBUixHQUFiO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiOztBQUVBLElBQU0sUUFBVyxRQUFRLEdBQVIsQ0FBWSxJQUF2QixxQkFBTjs7QUFFQSxRQUFRLE9BQVIsR0FBa0IsY0FBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxtQkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0seUJBRkY7QUFHSixhQUFTLElBSEw7QUFJSixVQUFNO0FBSkYsR0FuQlU7QUF5QmhCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLHVCQUZIO0FBR0gsYUFBUyxDQUhOO0FBSUgsVUFBTTtBQUpIO0FBekJXLENBQWxCO0FBZ0NBLFFBQVEsT0FBUixHQUFrQixVQUFDLElBQUQsRUFBVTtBQUMxQixRQUFNLFdBQU4sQ0FBa0IsS0FBbEI7QUFDQSxNQUFJLFNBQVMsS0FBSyxJQUFM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Q0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDWixnQkFBSSxLQUFLLENBQUwsSUFBVSxPQUFPLEtBQXJCLEVBQTRCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDNUIsZ0JBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLE1BQU0sSUFBSSxLQUFKLENBQVUsbURBQVYsQ0FBTjtBQUM3QixnQkFBSSxLQUFKLEVBQVc7QUFDVCxzQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9EO0FBQ0QsYUFGRCxNQUVPO0FBQ0wsa0JBQUksT0FBTyxLQUFYLEVBQWtCLFFBQVEsR0FBUixDQUFlLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbEMsU0FBNEMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUEvRCxzREFBb0gsS0FBSyxPQUF6SDtBQUNuQjtBQTlCd0M7QUErQjFDLFNBL0JELE1BK0JPO0FBQ0wsZ0JBQU0sSUFBSSxLQUFKLFdBQWtCLFNBQVMsVUFBM0IsVUFBMEMsS0FBMUMsQ0FBTjtBQUNEO0FBQ0YsT0FuQ0Q7QUE1Qlc7QUFnRVosR0FoRUQsTUFnRU87QUFDTCxVQUFNLElBQUksS0FBSiwwQ0FBZ0QsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUFuRSxPQUFOO0FBQ0Q7QUFDRixDQTlGRCIsImZpbGUiOiJjbWRzL3JoeW1lYnJhaW5fY21kcy9yaHltZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnZ29vZC1ndXktaHR0cCcpKClcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdyaHltZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnUmh5bWVicmFpbiByaHltZXMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGFuZzoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0lTTyA2MzktMSBsYW5ndWFnZSBjb2RlJyxcbiAgICBkZWZhdWx0OiAnZW4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBtYXg6IHtcbiAgICBhbGlhczogJ20nLFxuICAgIGRlc2M6ICdNYXggcmVzdWx0cyB0byByZXR1cm4nLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcClcbiAgY29uc3QgbWludXRlcyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBpZiAobWludXRlcyA8IDYwKSB7XG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSBpZiAobWludXRlcyA+PSA2MCkge1xuICAgIHJlc2V0ID0gdHJ1ZVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdFxuICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBSZXNldCBBUEkgbGltaXQgdG8gJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9LyR7Y29uZmlnLnJicmFpbi5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPCAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHJicmFpbjoge1xuICAgICAgICByaHltZToge1xuICAgICAgICAgIGxhbmc6IGFyZ3YubCxcbiAgICAgICAgICBtYXg6IGFyZ3YubSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICAgIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignUmh5bWVicmFpbicsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgICBjb25zdCB0YXNrID0gJ1JoeW1lcydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL3JoeW1lYnJhaW4uY29tL3RhbGs/ZnVuY3Rpb249Z2V0J1xuICAgIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3Rhc2t9JndvcmQ9JHt3b3JkfSZgXG4gICAgY29uc3QgcGNvbnQgPSBbXVxuICAgIHBjb250LnB1c2goYGxhbmc9JHtjb25maWcucmJyYWluLnJoeW1lLmxhbmd9JmApXG4gICAgcGNvbnQucHVzaChgbWF4UmVzdWx0cz0ke2NvbmZpZy5yYnJhaW4ucmh5bWUubWF4fSZgKVxuICAgIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICAgIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIGNvbnN0IHRvZmlsZSA9IHtcbiAgICAgIHR5cGU6ICdyaHltZScsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vcmh5bWVicmFpbi5jb20nLFxuICAgICAgdXJsLFxuICAgIH1cbiAgICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gICAgaHR0cCh7IHVybCB9LCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KVxuICAgICAgICBjb25zdCBsY29udCA9IFtdXG4gICAgICAgIF8uZWFjaChsaXN0LCAoaXRlbSkgPT4ge1xuICAgICAgICAgIGxjb250LnB1c2goaXRlbS53b3JkKVxuICAgICAgICB9KVxuICAgICAgICBsY29udC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgaWYgKGEgPCBiKSByZXR1cm4gLTFcbiAgICAgICAgICBpZiAoYSA+IGIpIHJldHVybiAxXG4gICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgcmNvbnQgPSBbXVxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8PSBsY29udC5sZW5ndGggLSAxOyBqKyspIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gbGNvbnRbal1cbiAgICAgICAgICByY29udC5wdXNoKGN0c3R5bGUoaXRlbSkpXG4gICAgICAgICAgaWYgKGl0ZW0uc2NvcmUgPj0gMzAwKSB7XG4gICAgICAgICAgICB0b2ZpbGVbW2BoaXNjb3JlJHtqfWBdXSA9IGl0ZW1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9maWxlW1tgcmh5bWUke2p9YF1dID0gaXRlbVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByY29udC5zb3J0KClcbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ1JoeW1lcycsIHRoZW1lLCByY29udC5qb2luKCcsICcpKVxuICAgICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLm1lcmdlKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICAgICAgaWYgKGFyZ3YucyAmJiAhY29uZmlnLm1lcmdlKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBzYXZlIHVzZXIgY29uZmlnLCBzZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUuXCIpXG4gICAgICAgIGlmIChyZXNldCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW59LyR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNvbmZpZy51c2FnZSkgY29uc29sZS5sb2coYCR7Y29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbn0vJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIsIHdpbGwgcmVzZXQgaW4gJHs1OSAtIG1pbnV0ZXN9IG1pbnV0ZXMuYClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06ICR7ZXJyb3J9YClcbiAgICAgIH1cbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihgUmVhY2hlZCB0aGlzIGhvdXIncyB1c2FnZSBsaW1pdCBvZiAke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0uYClcbiAgfVxufVxuIl19