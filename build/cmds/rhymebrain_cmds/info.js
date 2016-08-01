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
          if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
          if (reset) {
            console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.');
          } else {
            console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
          }
        } else {
          console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
        }
      });
    })();
  } else {
    throw new Error('Reached this hour\'s usage limit of ' + config.rbrain.date.limit + '.');
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL2luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxlQUFSLEdBQWI7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixhQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHNCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSx5QkFGRjtBQUdKLGFBQVMsSUFITDtBQUlKLFVBQU07QUFKRjtBQW5CVSxDQUFsQjtBQTBCQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQUksVUFBVSxLQUFkO0FBQ0EsTUFBTSxRQUFRLElBQUksSUFBSixDQUFTLE9BQU8sTUFBUCxDQUFj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QWlCLE1BQWpCO0FBQzVCLGNBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLFFBQVEsR0FBUixDQUFZLE1BQU0sR0FBTixDQUFVLDJCQUFWLENBQVo7QUFDN0IsY0FBSSxLQUFKLEVBQVc7QUFDVCxvQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9EO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsb0JBQVEsR0FBUixDQUFlLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbEMsU0FBNEMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUEvRCxzREFBb0gsS0FBSyxPQUF6SDtBQUNEO0FBQ0YsU0E5QkQsTUE4Qk87QUFDTCxrQkFBUSxLQUFSLENBQWlCLE1BQU0sR0FBTixDQUFVLElBQVYsV0FBdUIsU0FBUyxVQUFoQyxPQUFqQixTQUFtRSxNQUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixPQWxDRDtBQXZCVztBQTBEWixHQTFERCxNQTBETztBQUNMLFVBQU0sSUFBSSxLQUFKLDBDQUFnRCxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQW5FLE9BQU47QUFDRDtBQUNGLENBeEZEIiwiZmlsZSI6ImNtZHMvcmh5bWVicmFpbl9jbWRzL2luZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjowICovXG5jb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi8uLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2dvb2QtZ3V5LWh0dHAnKSgpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnaW5mbyA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnUmh5bWVicmFpbiB3b3JkIGluZm8nXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGFuZzoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0lTTyA2MzktMSBsYW5ndWFnZSBjb2RlJyxcbiAgICBkZWZhdWx0OiAnZW4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGxldCBwcm9jZWVkID0gZmFsc2VcbiAgY29uc3Qgc3RhbXAgPSBuZXcgRGF0ZShjb25maWcucmJyYWluLmRhdGUuc3RhbXApXG4gIGNvbnN0IG1pbnV0ZXMgPSBtb21lbnQobmV3IERhdGUpLmRpZmYoc3RhbXAsICdtaW51dGVzJylcbiAgbGV0IHJlc2V0ID0gZmFsc2VcbiAgaWYgKG1pbnV0ZXMgPCA2MCkge1xuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSBjb25maWcucmJyYWluLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKG1pbnV0ZXMgPj0gNjApIHtcbiAgICByZXNldCA9IHRydWVcbiAgICBjb25maWcucmJyYWluLmRhdGUuc3RhbXAgPSBtb21lbnQoKS5mb3JtYXQoKVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSBjb25maWcucmJyYWluLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5pbnRlcnZhbH0uYCkpXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH1cbiAgaWYgKGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPT09IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgfSBlbHNlIGlmIChjb25maWcucmJyYWluLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSAwXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSB7XG4gICAgcHJvY2VlZCA9IHRydWVcbiAgfVxuICBpZiAocHJvY2VlZCkge1xuICAgIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgICByYnJhaW46IHtcbiAgICAgICAgaW5mbzoge1xuICAgICAgICAgIGxhbmc6IGFyZ3YubCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICAgIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignUmh5bWVicmFpbicsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgICBjb25zdCB0YXNrID0gJ1dvcmRJbmZvJ1xuICAgIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vcmh5bWVicmFpbi5jb20vdGFsaz9mdW5jdGlvbj1nZXQnXG4gICAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7dGFza30md29yZD0ke3dvcmR9Jmxhbmc9JHtjb25maWcucmJyYWluLmluZm8ubGFuZ31gXG4gICAgY29uc3QgdXJsID0gZW5jb2RlVVJJKHVyaSlcbiAgICB0aGVtZXMubGFiZWxEb3duKCdXb3JkIEluZm8nLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgICB0eXBlOiAnd29yZCBpbmZvJyxcbiAgICAgIHNvdXJjZTogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgICBodHRwKHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGluZm8gPSBKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpXG4gICAgICAgIHRoZW1lcy5sYWJlbFJpZ2h0KCdBcnBhYmV0JywgdGhlbWUsIGluZm8ucHJvbilcbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ0lQQScsIHRoZW1lLCBpbmZvLmlwYSlcbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ1N5bGxhYmxlcycsIHRoZW1lLCBpbmZvLnN5bGxhYmxlcylcbiAgICAgICAgdG9maWxlLmFycGFiZXQgPSBpbmZvLnByb25cbiAgICAgICAgdG9maWxlLmlwYSA9IGluZm8uaXBhXG4gICAgICAgIHRvZmlsZS5zeWxsYWJsZXMgPSBpbmZvLnN5bGxhYmxlc1xuICAgICAgICBjb25zdCBmbGFncyA9IFtdXG4gICAgICAgIGlmIChpbmZvLmZsYWdzLm1hdGNoKC9hLykpIHtcbiAgICAgICAgICBmbGFncy5wdXNoKGN0c3R5bGUoYFske2NoYWxrLnJlZC5ib2xkKCdPZmZlbnNpdmUnKX1dYCkpXG4gICAgICAgICAgdG9maWxlLm9mZmVuc2l2ZSA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5mby5mbGFncy5tYXRjaCgvYi8pKSB7XG4gICAgICAgICAgZmxhZ3MucHVzaChjdHN0eWxlKCdbRm91bmQgaW4gZGljdGlvbmFyeV0nKSlcbiAgICAgICAgICB0b2ZpbGUuZGljdCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5mby5mbGFncy5tYXRjaCgvYy8pKSB7XG4gICAgICAgICAgZmxhZ3MucHVzaChjdHN0eWxlKCdbVHJ1c3RlZCBwcm9udW5jaWF0aW9uLCBub3QgZ2VuZXJhdGVkXScpKVxuICAgICAgICAgIHRvZmlsZS50cnVzdGVkID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHRoZW1lcy5sYWJlbFJpZ2h0KCdXb3JkIEZsYWdzJywgdGhlbWUsIGZsYWdzLmpvaW4oJycpKVxuICAgICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLm1lcmdlKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICAgICAgaWYgKGFyZ3YucyAmJiAhY29uZmlnLm1lcmdlKSBjb25zb2xlLmVycihjaGFsay5yZWQoJ1NldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZSEnKSlcbiAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbn0vJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcucmJyYWluLmRhdGUucmVtYWlufS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fS5gKVxuICB9XG59XG4iXX0=