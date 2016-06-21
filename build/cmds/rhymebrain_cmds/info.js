'use strict';

var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
var needle = require('needle');
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
  var userConfig = {
    info: {
      lang: argv.l,
      max: argv.m
    }
  };
  if (config.prefer) config = _.merge({}, config, userConfig);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.labelDown('Rhymebrain', theme, null);
  var word = argv.word;
  var task = 'WordInfo';
  var prefix = 'http://rhymebrain.com/talk?function=get';
  var uri = '' + prefix + task + '&word=' + word + '&';
  var pcont = [];
  pcont.push('lang=' + config.info.lang + '&');
  pcont.push('maxResults=' + config.info.max + '&');
  var rest = pcont.join('');
  var url = '' + uri + rest;
  url = encodeURI(url);
  themes.labelDown('Word Info', theme, null);
  var tofile = { type: 'word info', source: 'http://rhymebrain.com' };
  var ctstyle = _.get(chalk, theme.content.style);
  needle.get(url, function (error, response) {
    if (!error && response.statusCode === 200) {
      var info = response.body;
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
      if (argv.s && config.prefer) noon.save(CFILE, config);
    } else {
      console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL2luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNLFNBQVMsUUFBUSxjQUFSLENBQWY7QUFDQSxJQUFNLFFBQVEsUUFBUSxhQUFSLENBQWQ7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiOztBQUVBLElBQU0sUUFBVyxRQUFRLEdBQVIsQ0FBWSxJQUF2QixxQkFBTjs7QUFFQSxRQUFRLE9BQVIsR0FBa0IsYUFBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxzQkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0seUJBRkY7QUFHSixhQUFTLElBSEw7QUFJSixVQUFNO0FBSkY7QUFuQlUsQ0FBbEI7QUEwQkEsUUFBUSxPQUFSLEdBQWtCLFVBQUMsSUFBRCxFQUFVO0FBQzFCLFFBQU0sV0FBTixDQUFrQixLQUFsQjtBQUNBLE1BQUksU0FBUyxLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWI7QUFDQSxNQUFNLGFBQWE7QUFDakIsVUFBTTtBQUNKLFlBQU0sS0FBSyxDQURQO0FBRUosV0FBSyxLQUFLO0FBRk47QUFEVyxHQUFuQjtBQU1BLE1BQUksT0FBTyxNQUFYLEVB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TixDQUFVLEtBQVYsQ0FBbkU7QUFDRDtBQUNGLEdBNUJEO0FBNkJELENBdEREIiwiZmlsZSI6ImNtZHMvcmh5bWVicmFpbl9jbWRzL2luZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi8uLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ2luZm8gPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1JoeW1lYnJhaW4gd29yZCBpbmZvJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxhbmc6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdJU08gNjM5LTEgbGFuZ3VhZ2UgY29kZScsXG4gICAgZGVmYXVsdDogJ2VuJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgIGluZm86IHtcbiAgICAgIGxhbmc6IGFyZ3YubCxcbiAgICAgIG1heDogYXJndi5tLFxuICAgIH0sXG4gIH1cbiAgaWYgKGNvbmZpZy5wcmVmZXIpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdSaHltZWJyYWluJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgY29uc3QgdGFzayA9ICdXb3JkSW5mbydcbiAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly9yaHltZWJyYWluLmNvbS90YWxrP2Z1bmN0aW9uPWdldCdcbiAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7dGFza30md29yZD0ke3dvcmR9JmBcbiAgY29uc3QgcGNvbnQgPSBbXVxuICBwY29udC5wdXNoKGBsYW5nPSR7Y29uZmlnLmluZm8ubGFuZ30mYClcbiAgcGNvbnQucHVzaChgbWF4UmVzdWx0cz0ke2NvbmZpZy5pbmZvLm1heH0mYClcbiAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgdGhlbWVzLmxhYmVsRG93bignV29yZCBJbmZvJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHRvZmlsZSA9IHsgdHlwZTogJ3dvcmQgaW5mbycsIHNvdXJjZTogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbScgfVxuICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gIG5lZWRsZS5nZXQodXJsLCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgIGNvbnN0IGluZm8gPSByZXNwb25zZS5ib2R5XG4gICAgICB0aGVtZXMubGFiZWxSaWdodCgnQXJwYWJldCcsIHRoZW1lLCBpbmZvLnByb24pXG4gICAgICB0aGVtZXMubGFiZWxSaWdodCgnSVBBJywgdGhlbWUsIGluZm8uaXBhKVxuICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ1N5bGxhYmxlcycsIHRoZW1lLCBpbmZvLnN5bGxhYmxlcylcbiAgICAgIHRvZmlsZS5hcnBhYmV0ID0gaW5mby5wcm9uXG4gICAgICB0b2ZpbGUuaXBhID0gaW5mby5pcGFcbiAgICAgIHRvZmlsZS5zeWxsYWJsZXMgPSBpbmZvLnN5bGxhYmxlc1xuICAgICAgY29uc3QgZmxhZ3MgPSBbXVxuICAgICAgaWYgKGluZm8uZmxhZ3MubWF0Y2goL2EvKSkge1xuICAgICAgICBmbGFncy5wdXNoKGN0c3R5bGUoYFske2NoYWxrLnJlZC5ib2xkKCdPZmZlbnNpdmUnKX1dYCkpXG4gICAgICAgIHRvZmlsZS5vZmZlbnNpdmUgPSB0cnVlXG4gICAgICB9XG4gICAgICBpZiAoaW5mby5mbGFncy5tYXRjaCgvYi8pKSB7XG4gICAgICAgIGZsYWdzLnB1c2goY3RzdHlsZSgnW0ZvdW5kIGluIGRpY3Rpb25hcnldJykpXG4gICAgICAgIHRvZmlsZS5kaWN0ID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKGluZm8uZmxhZ3MubWF0Y2goL2MvKSkge1xuICAgICAgICBmbGFncy5wdXNoKGN0c3R5bGUoJ1tUcnVzdGVkIHByb251bmNpYXRpb24sIG5vdCBnZW5lcmF0ZWRdJykpXG4gICAgICAgIHRvZmlsZS50cnVzdGVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ1dvcmQgRmxhZ3MnLCB0aGVtZSwgZmxhZ3Muam9pbignJykpXG4gICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5wcmVmZXIpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgIH1cbiAgfSlcbn1cbiJdfQ==