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

exports.command = 'pronounce <word>';
exports.desc = 'Wordnik pronunciations';
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
    desc: 'Dictionary: ahd, century, cmu, macmillan, wiktionary, webster, wordnet',
    default: '',
    type: 'string'
  },
  type: {
    alias: 't',
    desc: 'Type: ahd, arpabet, gcide-diacritical, ipa',
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
          pronounce: {
            canon: argv.c,
            dict: argv.d,
            type: argv.t,
            limit: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'pronunciations';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.pronounce.canon + '&');
      if (config.wordnik.pronounce.dict !== '') pcont.push('sourceDictionary=' + config.wordnik.pronounce.dict + '&');
      if (config.wordnik.pronounce.type !== '') pcont.push('typeFormat=' + config.wordnik.pronounce.type + '&');
      pcont.push('limit=' + config.wordnik.pronounce.limit + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      themes.labelDown('Pronunciations', theme, null);
      var tofile = {
        type: 'pronunciation',
        source: 'http://www.wordnik.com',
        url: url
      };
      tofile.word = word;
      needle.get(url, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = response.body;
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            themes.labelRight(word, theme, item.raw + ' - Type - ' + item.rawType);
            tofile[['pronunciation' + i]] = item.raw;
            tofile[['type' + i]] = item.rawType;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3Byb25vdW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGtCQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHdCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSx5QkFGRDtBQUdMLGFBQVMsQ0FISjtBQUlMLFVBQU07QUFKRCxHQW5CUztBQXlCaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sZUFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQXpCUztBQStCaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sd0VBRkY7QUFHSixhQUFTLEVBSEw7QUFJSixVQUFNO0FBSkYsR0EvQlU7QUFxQ2hCLFFBQU07QUFD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QUFpQixDQUFqQixDQUFQLElBQWdDLEtBQUssR0FBckM7QUFDQSxtQkFBTyxVQUFRLENBQVIsQ0FBUCxJQUF1QixLQUFLLE9BQTVCO0FBQ0Q7QUFDRCxjQUFJLEtBQUssQ0FBVCxFQUFZLE1BQU0sT0FBTixDQUFjLEtBQUssQ0FBbkIsRUFBc0IsS0FBSyxDQUEzQixFQUE4QixNQUE5QjtBQUNaLGNBQUksS0FBSyxDQUFMLElBQVUsT0FBTyxLQUFyQixFQUE0QixLQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO0FBQzVCLGNBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLFFBQVEsR0FBUixDQUFZLE1BQU0sR0FBTixDQUFVLDJCQUFWLENBQVo7QUFDN0IsY0FBSSxLQUFKLEVBQVc7QUFDVCxvQkFBUSxHQUFSLENBQWUsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFuQyxTQUE2QyxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQWpFO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsb0JBQVEsR0FBUixDQUFlLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBbkMsU0FBNkMsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFqRSxxREFBc0gsSUFBdEg7QUFDRDtBQUNGLFNBaEJELE1BZ0JPO0FBQ0wsa0JBQVEsS0FBUixDQUFpQixNQUFNLEdBQU4sQ0FBVSxJQUFWLFdBQXVCLFNBQVMsVUFBaEMsT0FBakIsU0FBbUUsTUFBTSxHQUFOLENBQVUsS0FBVixDQUFuRTtBQUNEO0FBQ0YsT0FwQkQ7QUFuQ1c7QUF3RFosR0F4REQsTUF3RE87QUFDTCxZQUFRLEtBQVIsQ0FBYyxNQUFNLEdBQU4sMENBQWdELE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBcEUsT0FBZDtBQUNBLFlBQVEsSUFBUixDQUFhLENBQWI7QUFDRDtBQUNGLENBeEZEIiwiZmlsZSI6ImNtZHMvd29yZG5pa19jbWRzL3Byb25vdW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ3Byb25vdW5jZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnV29yZG5payBwcm9udW5jaWF0aW9ucydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsaW1pdDoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0xpbWl0IG51bWJlciBvZiByZXN1bHRzJyxcbiAgICBkZWZhdWx0OiA1LFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBjYW5vbjoge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJ1VzZSBjYW5vbmljYWwnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgZGljdDoge1xuICAgIGFsaWFzOiAnZCcsXG4gICAgZGVzYzogJ0RpY3Rpb25hcnk6IGFoZCwgY2VudHVyeSwgY211LCBtYWNtaWxsYW4sIHdpa3Rpb25hcnksIHdlYnN0ZXIsIHdvcmRuZXQnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICB0eXBlOiB7XG4gICAgYWxpYXM6ICd0JyxcbiAgICBkZXNjOiAnVHlwZTogYWhkLCBhcnBhYmV0LCBnY2lkZS1kaWFjcml0aWNhbCwgaXBhJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcClcbiAgY29uc3Qgbm93ID0gbW9tZW50KG5ldyBEYXRlKS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGNvbnN0IGRpZmYgPSA2MCAtIG5vd1xuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBpZiAoZGlmZiA8IDYwKSB7XG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIGlmIChkaWZmID49IDYwKSB7XG4gICAgcmVzZXQgPSB0cnVlXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLmxpbWl0XG4gICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYFJlc2V0IEFQSSBsaW1pdCB0byAke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5pbnRlcnZhbH0uYCkpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPT09IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgfSBlbHNlIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA8IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHdvcmRuaWs6IHtcbiAgICAgICAgcHJvbm91bmNlOiB7XG4gICAgICAgICAgY2Fub246IGFyZ3YuYyxcbiAgICAgICAgICBkaWN0OiBhcmd2LmQsXG4gICAgICAgICAgdHlwZTogYXJndi50LFxuICAgICAgICAgIGxpbWl0OiBhcmd2LmwsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdwcm9udW5jaWF0aW9ucydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICAgIGNvbnN0IGFwaWtleSA9IHByb2Nlc3MuZW52LldPUkROSUtcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt3b3JkfS8ke3Rhc2t9P2BcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgdXNlQ2Fub25pY2FsPSR7Y29uZmlnLndvcmRuaWsucHJvbm91bmNlLmNhbm9ufSZgKVxuICAgIGlmIChjb25maWcud29yZG5pay5wcm9ub3VuY2UuZGljdCAhPT0gJycpIHBjb250LnB1c2goYHNvdXJjZURpY3Rpb25hcnk9JHtjb25maWcud29yZG5pay5wcm9ub3VuY2UuZGljdH0mYClcbiAgICBpZiAoY29uZmlnLndvcmRuaWsucHJvbm91bmNlLnR5cGUgIT09ICcnKSBwY29udC5wdXNoKGB0eXBlRm9ybWF0PSR7Y29uZmlnLndvcmRuaWsucHJvbm91bmNlLnR5cGV9JmApXG4gICAgcGNvbnQucHVzaChgbGltaXQ9JHtjb25maWcud29yZG5pay5wcm9ub3VuY2UubGltaXR9JmApXG4gICAgcGNvbnQucHVzaChgYXBpX2tleT0ke2FwaWtleX1gKVxuICAgIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICAgIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIHRoZW1lcy5sYWJlbERvd24oJ1Byb251bmNpYXRpb25zJywgdGhlbWUsIG51bGwpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ3Byb251bmNpYXRpb24nLFxuICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIHRvZmlsZS53b3JkID0gd29yZFxuICAgIG5lZWRsZS5nZXQodXJsLCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gcmVzcG9uc2UuYm9keVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsaXN0Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQod29yZCwgdGhlbWUsIGAke2l0ZW0ucmF3fSAtIFR5cGUgLSAke2l0ZW0ucmF3VHlwZX1gKVxuICAgICAgICAgIHRvZmlsZVtbYHByb251bmNpYXRpb24ke2l9YF1dID0gaXRlbS5yYXdcbiAgICAgICAgICB0b2ZpbGVbW2B0eXBlJHtpfWBdXSA9IGl0ZW0ucmF3VHlwZVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAke2RpZmZ9IG1pbnV0ZXMuYClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgJHtjaGFsay5yZWQuYm9sZChgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OmApfSAke2NoYWxrLnJlZChlcnJvcil9YClcbiAgICAgIH1cbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYCkpXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH1cbn1cbiJdfQ==