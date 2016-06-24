'use strict';

var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
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
  var userConfig = {
    pronounce: {
      canon: argv.c,
      dict: argv.d,
      type: argv.t,
      limit: argv.l
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
  pcont.push('useCanonical=' + config.pronounce.canon + '&');
  if (config.pronounce.dict !== '') pcont.push('sourceDictionary=' + config.pronounce.dict + '&');
  if (config.pronounce.type !== '') pcont.push('typeFormat=' + config.pronounce.type + '&');
  pcont.push('limit=' + config.pronounce.limit + '&');
  pcont.push('api_key=' + apikey);
  var rest = pcont.join('');
  var url = '' + uri + rest;
  url = encodeURI(url);
  themes.labelDown('Pronunciations', theme, null);
  var tofile = { type: 'pronunciation', source: 'http://www.wordnik.com' };
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
    } else {
      console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3Byb25vdW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixrQkFBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSx3QkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0seUJBRkQ7QUFHTCxhQUFTLENBSEo7QUFJTCxVQUFNO0FBSkQsR0FuQlM7QUF5QmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLGVBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0F6QlM7QUErQmhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLHdFQUZGO0FBR0osYUFBUyxFQUhMO0FBSUosVUFBTTtBQUpGLEdBL0JVO0FBcUNoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSw0Q0FGRjtBQUdKLGFB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WjtBQUM5QixLQVhELE1BV087QUFDTCxjQUFRLEtBQVIsQ0FBaUIsTUFBTSxHQUFOLENBQVUsSUFBVixXQUF1QixTQUFTLFVBQWhDLE9BQWpCLFNBQW1FLE1BQU0sR0FBTixDQUFVLEtBQVYsQ0FBbkU7QUFDRDtBQUNGLEdBZkQ7QUFnQkQsQ0EvQ0QiLCJmaWxlIjoiY21kcy93b3JkbmlrX2NtZHMvcHJvbm91bmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbmVlZGxlID0gcmVxdWlyZSgnbmVlZGxlJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdwcm9ub3VuY2UgPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1dvcmRuaWsgcHJvbnVuY2lhdGlvbnMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGltaXQ6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdMaW1pdCBudW1iZXIgb2YgcmVzdWx0cycsXG4gICAgZGVmYXVsdDogNSxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgY2Fub246IHtcbiAgICBhbGlhczogJ2MnLFxuICAgIGRlc2M6ICdVc2UgY2Fub25pY2FsJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGRpY3Q6IHtcbiAgICBhbGlhczogJ2QnLFxuICAgIGRlc2M6ICdEaWN0aW9uYXJ5OiBhaGQsIGNlbnR1cnksIGNtdSwgbWFjbWlsbGFuLCB3aWt0aW9uYXJ5LCB3ZWJzdGVyLCB3b3JkbmV0JyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgdHlwZToge1xuICAgIGFsaWFzOiAndCcsXG4gICAgZGVzYzogJ1R5cGU6IGFoZCwgYXJwYWJldCwgZ2NpZGUtZGlhY3JpdGljYWwsIGlwYScsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICBwcm9ub3VuY2U6IHtcbiAgICAgIGNhbm9uOiBhcmd2LmMsXG4gICAgICBkaWN0OiBhcmd2LmQsXG4gICAgICB0eXBlOiBhcmd2LnQsXG4gICAgICBsaW1pdDogYXJndi5sLFxuICAgIH0sXG4gIH1cbiAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgY29uc3Qgd29yZCA9IGFyZ3Yud29yZFxuICBjb25zdCB0YXNrID0gJ3Byb251bmNpYXRpb25zJ1xuICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICBjb25zdCBhcGlrZXkgPSBwcm9jZXNzLmVudi5XT1JETklLXG4gIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3dvcmR9LyR7dGFza30/YFxuICBjb25zdCBwY29udCA9IFtdXG4gIHBjb250LnB1c2goYHVzZUNhbm9uaWNhbD0ke2NvbmZpZy5wcm9ub3VuY2UuY2Fub259JmApXG4gIGlmIChjb25maWcucHJvbm91bmNlLmRpY3QgIT09ICcnKSBwY29udC5wdXNoKGBzb3VyY2VEaWN0aW9uYXJ5PSR7Y29uZmlnLnByb25vdW5jZS5kaWN0fSZgKVxuICBpZiAoY29uZmlnLnByb25vdW5jZS50eXBlICE9PSAnJykgcGNvbnQucHVzaChgdHlwZUZvcm1hdD0ke2NvbmZpZy5wcm9ub3VuY2UudHlwZX0mYClcbiAgcGNvbnQucHVzaChgbGltaXQ9JHtjb25maWcucHJvbm91bmNlLmxpbWl0fSZgKVxuICBwY29udC5wdXNoKGBhcGlfa2V5PSR7YXBpa2V5fWApXG4gIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICBsZXQgdXJsID0gYCR7dXJpfSR7cmVzdH1gXG4gIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gIHRoZW1lcy5sYWJlbERvd24oJ1Byb251bmNpYXRpb25zJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHRvZmlsZSA9IHsgdHlwZTogJ3Byb251bmNpYXRpb24nLCBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyB9XG4gIHRvZmlsZS53b3JkID0gd29yZFxuICBuZWVkbGUuZ2V0KHVybCwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICBjb25zdCBsaXN0ID0gcmVzcG9uc2UuYm9keVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGlzdC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQod29yZCwgdGhlbWUsIGAke2l0ZW0ucmF3fSAtIFR5cGUgLSAke2l0ZW0ucmF3VHlwZX1gKVxuICAgICAgICB0b2ZpbGVbW2Bwcm9udW5jaWF0aW9uJHtpfWBdXSA9IGl0ZW0ucmF3XG4gICAgICAgIHRvZmlsZVtbYHR5cGUke2l9YF1dID0gaXRlbS5yYXdUeXBlXG4gICAgICB9XG4gICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgIH1cbiAgfSlcbn1cbiJdfQ==