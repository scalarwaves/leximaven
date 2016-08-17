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
          info: {
            lang: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Rhymebrain');
      var word = argv.word;
      var task = 'WordInfo';
      var prefix = 'http://rhymebrain.com/talk?function=get';
      var uri = '' + prefix + task + '&word=' + word + '&lang=' + config.rbrain.info.lang;
      var url = encodeURI(uri);
      themes.label(theme, 'down', 'Word Info');
      var tofile = {
        type: 'word info',
        source: 'http://rhymebrain.com',
        url: url
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var info = JSON.parse(response.body);
          themes.label(theme, 'right', 'Arpabet', info.pron);
          themes.label(theme, 'right', 'IPA', info.ipa);
          themes.label(theme, 'right', 'Syllables', info.syllables);
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
          themes.label(theme, 'right', 'Word Flags', flags.join(''));
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (argv.s && config.merge) noon.save(CFILE, config);
          if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
          if (reset) {
            console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.');
          } else {
            if (config.usage) console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL2luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxlQUFSLEdBQWI7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixhQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHNCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSx5QkFGRjtBQUdKLGFBQVMsSUFITDtBQUlKLFVBQU07QUFKRjtBQW5CVSxDQUFsQjtBQTBCQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQUksVUFBVSxLQUFkO0FBQ0EsTUFBSSxRQUFRLEtBQVo7QUFDQSxNQUFNLFFBQVEsSUFBSSxJQUFK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QUFwQixFQUE2QixZQUE3QixFQUEyQyxNQUFNLElBQU4sQ0FBVyxFQUFYLENBQTNDO0FBQ0EsY0FBSSxLQUFLLENBQVQsRUFBWSxNQUFNLE9BQU4sQ0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDWixjQUFJLEtBQUssQ0FBTCxJQUFVLE9BQU8sS0FBckIsRUFBNEIsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM1QixjQUFJLEtBQUssQ0FBTCxJQUFVLENBQUMsT0FBTyxLQUF0QixFQUE2QixNQUFNLElBQUksS0FBSixDQUFVLG1EQUFWLENBQU47QUFDN0IsY0FBSSxLQUFKLEVBQVc7QUFDVCxvQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9EO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsZ0JBQUksT0FBTyxLQUFYLEVBQWtCLFFBQVEsR0FBUixDQUFlLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbEMsU0FBNEMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUEvRCxzREFBb0gsS0FBSyxPQUF6SDtBQUNuQjtBQUNGLFNBOUJELE1BOEJPO0FBQ0wsZ0JBQU0sSUFBSSxLQUFKLFdBQWtCLFNBQVMsVUFBM0IsVUFBMEMsS0FBMUMsQ0FBTjtBQUNEO0FBQ0YsT0FsQ0Q7QUF2Qlc7QUEwRFosR0ExREQsTUEwRE87QUFDTCxVQUFNLElBQUksS0FBSiwwQ0FBZ0QsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUFuRSxPQUFOO0FBQ0Q7QUFDRixDQXhFRCIsImZpbGUiOiJjbWRzL3JoeW1lYnJhaW5fY21kcy9pbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdnb29kLWd1eS1odHRwJykoKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ2luZm8gPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1JoeW1lYnJhaW4gd29yZCBpbmZvJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxhbmc6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdJU08gNjM5LTEgbGFuZ3VhZ2UgY29kZScsXG4gICAgZGVmYXVsdDogJ2VuJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wKVxuICBjb25zdCBtaW51dGVzID0gbW9tZW50KG5ldyBEYXRlKS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGNvbnN0IGNoZWNrU3RhbXAgPSB0b29scy5saW1pdFJicmFpbihjb25maWcpXG4gIGNvbmZpZyA9IGNoZWNrU3RhbXBbMF1cbiAgcHJvY2VlZCA9IGNoZWNrU3RhbXBbMV1cbiAgcmVzZXQgPSBjaGVja1N0YW1wWzJdXG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHJicmFpbjoge1xuICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgbGFuZzogYXJndi5sLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWwodGhlbWUsICdkb3duJywgJ1JoeW1lYnJhaW4nKVxuICAgIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgICBjb25zdCB0YXNrID0gJ1dvcmRJbmZvJ1xuICAgIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vcmh5bWVicmFpbi5jb20vdGFsaz9mdW5jdGlvbj1nZXQnXG4gICAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7dGFza30md29yZD0ke3dvcmR9Jmxhbmc9JHtjb25maWcucmJyYWluLmluZm8ubGFuZ31gXG4gICAgY29uc3QgdXJsID0gZW5jb2RlVVJJKHVyaSlcbiAgICB0aGVtZXMubGFiZWwodGhlbWUsICdkb3duJywgJ1dvcmQgSW5mbycpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ3dvcmQgaW5mbycsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vcmh5bWVicmFpbi5jb20nLFxuICAgICAgdXJsLFxuICAgIH1cbiAgICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gICAgaHR0cCh7IHVybCB9LCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBpbmZvID0gSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KVxuICAgICAgICB0aGVtZXMubGFiZWwodGhlbWUsICdyaWdodCcsICdBcnBhYmV0JywgaW5mby5wcm9uKVxuICAgICAgICB0aGVtZXMubGFiZWwodGhlbWUsICdyaWdodCcsICdJUEEnLCBpbmZvLmlwYSlcbiAgICAgICAgdGhlbWVzLmxhYmVsKHRoZW1lLCAncmlnaHQnLCAnU3lsbGFibGVzJywgaW5mby5zeWxsYWJsZXMpXG4gICAgICAgIHRvZmlsZS5hcnBhYmV0ID0gaW5mby5wcm9uXG4gICAgICAgIHRvZmlsZS5pcGEgPSBpbmZvLmlwYVxuICAgICAgICB0b2ZpbGUuc3lsbGFibGVzID0gaW5mby5zeWxsYWJsZXNcbiAgICAgICAgY29uc3QgZmxhZ3MgPSBbXVxuICAgICAgICBpZiAoaW5mby5mbGFncy5tYXRjaCgvYS8pKSB7XG4gICAgICAgICAgZmxhZ3MucHVzaChjdHN0eWxlKGBbJHtjaGFsay5yZWQuYm9sZCgnT2ZmZW5zaXZlJyl9XWApKVxuICAgICAgICAgIHRvZmlsZS5vZmZlbnNpdmUgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZm8uZmxhZ3MubWF0Y2goL2IvKSkge1xuICAgICAgICAgIGZsYWdzLnB1c2goY3RzdHlsZSgnW0ZvdW5kIGluIGRpY3Rpb25hcnldJykpXG4gICAgICAgICAgdG9maWxlLmRpY3QgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZm8uZmxhZ3MubWF0Y2goL2MvKSkge1xuICAgICAgICAgIGZsYWdzLnB1c2goY3RzdHlsZSgnW1RydXN0ZWQgcHJvbnVuY2lhdGlvbiwgbm90IGdlbmVyYXRlZF0nKSlcbiAgICAgICAgICB0b2ZpbGUudHJ1c3RlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICB0aGVtZXMubGFiZWwodGhlbWUsICdyaWdodCcsICdXb3JkIEZsYWdzJywgZmxhZ3Muam9pbignJykpXG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHNhdmUgdXNlciBjb25maWcsIHNldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZS5cIilcbiAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbn0vJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9IHJlcXVlc3RzIHJlbWFpbmluZyB0aGlzIGhvdXIuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29uZmlnLnVzYWdlKSBjb25zb2xlLmxvZyhgJHtjb25maWcucmJyYWluLmRhdGUucmVtYWlufS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTogJHtlcnJvcn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fS5gKVxuICB9XG59XG4iXX0=