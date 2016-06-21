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
  if (config.prefer) config = _.merge({}, config, userConfig);
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
      if (argv.s && config.prefer) noon.save(CFILE, config);
    } else {
      console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3Byb25vdW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixrQkFBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSx3QkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0seUJBRkQ7QUFHTCxhQUFTLENBSEo7QUFJTCxVQUFNO0FBSkQsR0FuQlM7QUF5QmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLGVBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0F6QlM7QUErQmhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLHdFQUZGO0FBR0osYUFBUyxFQUhMO0FBSUosVUFBTTtBQUpGLEdBL0JVO0FBcUNoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSw0Q0FGRjtBQUdKLGFB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QUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixHQWREO0FBZUQsQ0E5Q0QiLCJmaWxlIjoiY21kcy93b3JkbmlrX2NtZHMvcHJvbm91bmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbmVlZGxlID0gcmVxdWlyZSgnbmVlZGxlJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdwcm9ub3VuY2UgPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1dvcmRuaWsgcHJvbnVuY2lhdGlvbnMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGltaXQ6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdMaW1pdCBudW1iZXIgb2YgcmVzdWx0cycsXG4gICAgZGVmYXVsdDogNSxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgY2Fub246IHtcbiAgICBhbGlhczogJ2MnLFxuICAgIGRlc2M6ICdVc2UgY2Fub25pY2FsJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGRpY3Q6IHtcbiAgICBhbGlhczogJ2QnLFxuICAgIGRlc2M6ICdEaWN0aW9uYXJ5OiBhaGQsIGNlbnR1cnksIGNtdSwgbWFjbWlsbGFuLCB3aWt0aW9uYXJ5LCB3ZWJzdGVyLCB3b3JkbmV0JyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgdHlwZToge1xuICAgIGFsaWFzOiAndCcsXG4gICAgZGVzYzogJ1R5cGU6IGFoZCwgYXJwYWJldCwgZ2NpZGUtZGlhY3JpdGljYWwsIGlwYScsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICBwcm9ub3VuY2U6IHtcbiAgICAgIGNhbm9uOiBhcmd2LmMsXG4gICAgICBkaWN0OiBhcmd2LmQsXG4gICAgICB0eXBlOiBhcmd2LnQsXG4gICAgICBsaW1pdDogYXJndi5sLFxuICAgIH0sXG4gIH1cbiAgaWYgKGNvbmZpZy5wcmVmZXIpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdXb3JkbmlrJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgY29uc3QgdGFzayA9ICdwcm9udW5jaWF0aW9ucydcbiAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly9hcGkud29yZG5pay5jb206ODAvdjQvd29yZC5qc29uLydcbiAgY29uc3QgYXBpa2V5ID0gcHJvY2Vzcy5lbnYuV09SRE5JS1xuICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt3b3JkfS8ke3Rhc2t9P2BcbiAgY29uc3QgcGNvbnQgPSBbXVxuICBwY29udC5wdXNoKGB1c2VDYW5vbmljYWw9JHtjb25maWcucHJvbm91bmNlLmNhbm9ufSZgKVxuICBpZiAoY29uZmlnLnByb25vdW5jZS5kaWN0ICE9PSAnJykgcGNvbnQucHVzaChgc291cmNlRGljdGlvbmFyeT0ke2NvbmZpZy5wcm9ub3VuY2UuZGljdH0mYClcbiAgaWYgKGNvbmZpZy5wcm9ub3VuY2UudHlwZSAhPT0gJycpIHBjb250LnB1c2goYHR5cGVGb3JtYXQ9JHtjb25maWcucHJvbm91bmNlLnR5cGV9JmApXG4gIHBjb250LnB1c2goYGxpbWl0PSR7Y29uZmlnLnByb25vdW5jZS5saW1pdH0mYClcbiAgcGNvbnQucHVzaChgYXBpX2tleT0ke2FwaWtleX1gKVxuICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICB0aGVtZXMubGFiZWxEb3duKCdQcm9udW5jaWF0aW9ucycsIHRoZW1lLCBudWxsKVxuICBjb25zdCB0b2ZpbGUgPSB7IHR5cGU6ICdwcm9udW5jaWF0aW9uJywgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScgfVxuICB0b2ZpbGUud29yZCA9IHdvcmRcbiAgbmVlZGxlLmdldCh1cmwsIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgY29uc3QgbGlzdCA9IHJlc3BvbnNlLmJvZHlcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgIHRoZW1lcy5sYWJlbFJpZ2h0KHdvcmQsIHRoZW1lLCBgJHtpdGVtLnJhd30gLSBUeXBlIC0gJHtpdGVtLnJhd1R5cGV9YClcbiAgICAgICAgdG9maWxlW1tgcHJvbnVuY2lhdGlvbiR7aX1gXV0gPSBpdGVtLnJhd1xuICAgICAgICB0b2ZpbGVbW2B0eXBlJHtpfWBdXSA9IGl0ZW0ucmF3VHlwZVxuICAgICAgfVxuICAgICAgaWYgKGFyZ3YubykgdG9vbHMub3V0RmlsZShhcmd2Lm8sIGFyZ3YuZiwgdG9maWxlKVxuICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcucHJlZmVyKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihgJHtjaGFsay5yZWQuYm9sZChgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OmApfSAke2NoYWxrLnJlZChlcnJvcil9YClcbiAgICB9XG4gIH0pXG59XG4iXX0=