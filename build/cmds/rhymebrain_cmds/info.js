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

exports.command = 'info <word>';
exports.desc = 'Rhymebrain word info';
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
          info: {
            lang: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Rhymebrain', theme, null);
      var word = argv.word;
      var task = 'WordInfo';
      var prefix = 'http://rhymebrain.com/talk?function=get';
      var uri = '' + prefix + task + '&word=' + word + '&lang=' + config.rbrain.info.lang;
      var url = encodeURI(uri);
      themes.labelDown('Word Info', theme, null);
      var tofile = {
        type: 'word info',
        source: 'http://rhymebrain.com',
        url: url
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var info = JSON.parse(response.body);
          themes.labelRight('Arpabet', theme, info.pron);
          themes.labelRight('IPA', theme, info.ipa);
          themes.labelRight('Syllables', theme, info.syllables);
          tofile.arpabet = info.pron;
          tofile.ipa = info.ipa;
          tofile.syllables = info.syllables;
          var flags = [];
          if (info.flags.match(/a/)) {
            flags.push(ctstyle('[' + chalk.red.bold('Offensive') + ']'));
            tofile.offensive = true;
          }
          if (info.flags.match(/b/)) {
            flags.push(ctstyle('[Found in dictionary]'));
            tofile.dict = true;
          }
          if (info.flags.match(/c/)) {
            flags.push(ctstyle('[Trusted pronunciation, not generated]'));
            tofile.trusted = true;
          }
          themes.labelRight('Word Flags', theme, flags.join(''));
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (argv.s && config.merge) noon.save(CFILE, config);
          if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
          if (reset) {
            console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.');
          } else {
            console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
          }
        } else {
          throw new Error('HTTP ' + response.statusCode + ': ' + error);
        }
      });
    })();
  } else {
    throw new Error('Reached this hour\'s usage limit of ' + config.rbrain.date.limit + '.');
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL2luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxlQUFSLEdBQWI7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixhQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHNCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSx5QkFGRjtBQUdKLGFBQVMsSUFITDtBQUlKLFVBQU07QUFKRjtBQW5CVSxDQUFsQjtBQTBCQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQUksVUFBVSxLQUFkO0FBQ0EsTUFBTSxRQUFRLElBQUksSUFBSixDQUFTLE9BQU8sTUFBUCxDQUFj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QWlCLE1BQWpCO0FBQzVCLGNBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLE1BQU0sSUFBSSxLQUFKLENBQVUsbURBQVYsQ0FBTjtBQUM3QixjQUFJLEtBQUosRUFBVztBQUNULG9CQUFRLEdBQVIsQ0FBZSxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLE1BQWxDLFNBQTRDLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsS0FBL0Q7QUFDRCxXQUZELE1BRU87QUFDTCxvQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9ELHNEQUFvSCxLQUFLLE9BQXpIO0FBQ0Q7QUFDRixTQTlCRCxNQThCTztBQUNMLGdCQUFNLElBQUksS0FBSixXQUFrQixTQUFTLFVBQTNCLFVBQTBDLEtBQTFDLENBQU47QUFDRDtBQUNGLE9BbENEO0FBdkJXO0FBMERaLEdBMURELE1BMERPO0FBQ0wsVUFBTSxJQUFJLEtBQUosMENBQWdELE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsS0FBbkUsT0FBTjtBQUNEO0FBQ0YsQ0F4RkQiLCJmaWxlIjoiY21kcy9yaHltZWJyYWluX2NtZHMvaW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnZ29vZC1ndXktaHR0cCcpKClcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdpbmZvIDx3b3JkPidcbmV4cG9ydHMuZGVzYyA9ICdSaHltZWJyYWluIHdvcmQgaW5mbydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsYW5nOiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnSVNPIDYzOS0xIGxhbmd1YWdlIGNvZGUnLFxuICAgIGRlZmF1bHQ6ICdlbicsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcClcbiAgY29uc3QgbWludXRlcyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBpZiAobWludXRlcyA8IDYwKSB7XG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSBpZiAobWludXRlcyA+PSA2MCkge1xuICAgIHJlc2V0ID0gdHJ1ZVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdFxuICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBSZXNldCBBUEkgbGltaXQgdG8gJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9LyR7Y29uZmlnLnJicmFpbi5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPCAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHJicmFpbjoge1xuICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgbGFuZzogYXJndi5sLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdSaHltZWJyYWluJywgdGhlbWUsIG51bGwpXG4gICAgY29uc3Qgd29yZCA9IGFyZ3Yud29yZFxuICAgIGNvbnN0IHRhc2sgPSAnV29yZEluZm8nXG4gICAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly9yaHltZWJyYWluLmNvbS90YWxrP2Z1bmN0aW9uPWdldCdcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt0YXNrfSZ3b3JkPSR7d29yZH0mbGFuZz0ke2NvbmZpZy5yYnJhaW4uaW5mby5sYW5nfWBcbiAgICBjb25zdCB1cmwgPSBlbmNvZGVVUkkodXJpKVxuICAgIHRoZW1lcy5sYWJlbERvd24oJ1dvcmQgSW5mbycsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHRvZmlsZSA9IHtcbiAgICAgIHR5cGU6ICd3b3JkIGluZm8nLFxuICAgICAgc291cmNlOiAnaHR0cDovL3JoeW1lYnJhaW4uY29tJyxcbiAgICAgIHVybCxcbiAgICB9XG4gICAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICAgIGh0dHAoeyB1cmwgfSwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc3QgaW5mbyA9IEpTT04ucGFyc2UocmVzcG9uc2UuYm9keSlcbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ0FycGFiZXQnLCB0aGVtZSwgaW5mby5wcm9uKVxuICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnSVBBJywgdGhlbWUsIGluZm8uaXBhKVxuICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnU3lsbGFibGVzJywgdGhlbWUsIGluZm8uc3lsbGFibGVzKVxuICAgICAgICB0b2ZpbGUuYXJwYWJldCA9IGluZm8ucHJvblxuICAgICAgICB0b2ZpbGUuaXBhID0gaW5mby5pcGFcbiAgICAgICAgdG9maWxlLnN5bGxhYmxlcyA9IGluZm8uc3lsbGFibGVzXG4gICAgICAgIGNvbnN0IGZsYWdzID0gW11cbiAgICAgICAgaWYgKGluZm8uZmxhZ3MubWF0Y2goL2EvKSkge1xuICAgICAgICAgIGZsYWdzLnB1c2goY3RzdHlsZShgWyR7Y2hhbGsucmVkLmJvbGQoJ09mZmVuc2l2ZScpfV1gKSlcbiAgICAgICAgICB0b2ZpbGUub2ZmZW5zaXZlID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmZvLmZsYWdzLm1hdGNoKC9iLykpIHtcbiAgICAgICAgICBmbGFncy5wdXNoKGN0c3R5bGUoJ1tGb3VuZCBpbiBkaWN0aW9uYXJ5XScpKVxuICAgICAgICAgIHRvZmlsZS5kaWN0ID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmZvLmZsYWdzLm1hdGNoKC9jLykpIHtcbiAgICAgICAgICBmbGFncy5wdXNoKGN0c3R5bGUoJ1tUcnVzdGVkIHByb251bmNpYXRpb24sIG5vdCBnZW5lcmF0ZWRdJykpXG4gICAgICAgICAgdG9maWxlLnRydXN0ZWQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ1dvcmQgRmxhZ3MnLCB0aGVtZSwgZmxhZ3Muam9pbignJykpXG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHNhdmUgdXNlciBjb25maWcsIHNldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZS5cIilcbiAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbn0vJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcucmJyYWluLmRhdGUucmVtYWlufS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTogJHtlcnJvcn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fS5gKVxuICB9XG59XG4iXX0=