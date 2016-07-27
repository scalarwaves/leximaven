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
            lang: argv.l,
            max: argv.m
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Rhymebrain', theme, null);
      var word = argv.word;
      var task = 'WordInfo';
      var prefix = 'http://rhymebrain.com/talk?function=get';
      var uri = '' + prefix + task + '&word=' + word + '&';
      var pcont = [];
      pcont.push('lang=' + config.rbrain.info.lang + '&');
      pcont.push('maxResults=' + config.rbrain.info.max + '&');
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      themes.labelDown('Word Info', theme, null);
      var tofile = {
        type: 'word info',
        source: 'http://rhymebrain.com',
        url: url
      };
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
    console.error(chalk.red('Reached this hour\'s usage limit of ' + config.rbrain.date.limit + '.'));
    process.exit(1);
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL2luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQU0sU0FBUyxRQUFRLGNBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLGFBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixhQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHNCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSx5QkFGRjtBQUdKLGFBQVMsSUFITDtBQUlKLFVBQU07QUFKRjtBQW5CVSxDQUFsQjtBQTBCQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQUksVUFBVSxLQUFkO0FBQ0EsTUFBTSxRQUFRLElBQUksSUFBSixDQUFTLE9BQU8sTUFBUCxDQUFj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TixDQUFXLEVBQVgsQ0FBdkM7QUFDQSxjQUFJLEtBQUssQ0FBVCxFQUFZLE1BQU0sT0FBTixDQUFjLEtBQUssQ0FBbkIsRUFBc0IsS0FBSyxDQUEzQixFQUE4QixNQUE5QjtBQUNaLGNBQUksS0FBSyxDQUFMLElBQVUsT0FBTyxLQUFyQixFQUE0QixLQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO0FBQzVCLGNBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLFFBQVEsR0FBUixDQUFZLE1BQU0sR0FBTixDQUFVLDJCQUFWLENBQVo7QUFDN0IsY0FBSSxLQUFKLEVBQVc7QUFDVCxvQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9EO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsb0JBQVEsR0FBUixDQUFlLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbEMsU0FBNEMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUEvRCxzREFBb0gsS0FBSyxPQUF6SDtBQUNEO0FBQ0YsU0E5QkQsTUE4Qk87QUFDTCxrQkFBUSxLQUFSLENBQWlCLE1BQU0sR0FBTixDQUFVLElBQVYsV0FBdUIsU0FBUyxVQUFoQyxPQUFqQixTQUFtRSxNQUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixPQWxDRDtBQTdCVztBQWdFWixHQWhFRCxNQWdFTztBQUNMLFlBQVEsS0FBUixDQUFjLE1BQU0sR0FBTiwwQ0FBZ0QsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUFuRSxPQUFkO0FBQ0EsWUFBUSxJQUFSLENBQWEsQ0FBYjtBQUNEO0FBQ0YsQ0EvRkQiLCJmaWxlIjoiY21kcy9yaHltZWJyYWluX2NtZHMvaW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ2luZm8gPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1JoeW1lYnJhaW4gd29yZCBpbmZvJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxhbmc6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdJU08gNjM5LTEgbGFuZ3VhZ2UgY29kZScsXG4gICAgZGVmYXVsdDogJ2VuJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wKVxuICBjb25zdCBtaW51dGVzID0gbW9tZW50KG5ldyBEYXRlKS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGlmIChtaW51dGVzIDwgNjApIHtcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIGlmIChtaW51dGVzID49IDYwKSB7XG4gICAgcmVzZXQgPSB0cnVlXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLmxpbWl0XG4gICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYFJlc2V0IEFQSSBsaW1pdCB0byAke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0vJHtjb25maWcucmJyYWluLmRhdGUuaW50ZXJ2YWx9LmApKVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSBjb25maWcucmJyYWluLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcucmJyYWluLmRhdGUucmVtYWluID09PSAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gIH0gZWxzZSBpZiAoY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA8IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgcmJyYWluOiB7XG4gICAgICAgIGluZm86IHtcbiAgICAgICAgICBsYW5nOiBhcmd2LmwsXG4gICAgICAgICAgbWF4OiBhcmd2Lm0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1JoeW1lYnJhaW4nLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdXb3JkSW5mbydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL3JoeW1lYnJhaW4uY29tL3RhbGs/ZnVuY3Rpb249Z2V0J1xuICAgIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3Rhc2t9JndvcmQ9JHt3b3JkfSZgXG4gICAgY29uc3QgcGNvbnQgPSBbXVxuICAgIHBjb250LnB1c2goYGxhbmc9JHtjb25maWcucmJyYWluLmluZm8ubGFuZ30mYClcbiAgICBwY29udC5wdXNoKGBtYXhSZXN1bHRzPSR7Y29uZmlnLnJicmFpbi5pbmZvLm1heH0mYClcbiAgICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgICBsZXQgdXJsID0gYCR7dXJpfSR7cmVzdH1gXG4gICAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgICB0aGVtZXMubGFiZWxEb3duKCdXb3JkIEluZm8nLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgICB0eXBlOiAnd29yZCBpbmZvJyxcbiAgICAgIHNvdXJjZTogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgICBuZWVkbGUuZ2V0KHVybCwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc3QgaW5mbyA9IHJlc3BvbnNlLmJvZHlcbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ0FycGFiZXQnLCB0aGVtZSwgaW5mby5wcm9uKVxuICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnSVBBJywgdGhlbWUsIGluZm8uaXBhKVxuICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnU3lsbGFibGVzJywgdGhlbWUsIGluZm8uc3lsbGFibGVzKVxuICAgICAgICB0b2ZpbGUuYXJwYWJldCA9IGluZm8ucHJvblxuICAgICAgICB0b2ZpbGUuaXBhID0gaW5mby5pcGFcbiAgICAgICAgdG9maWxlLnN5bGxhYmxlcyA9IGluZm8uc3lsbGFibGVzXG4gICAgICAgIGNvbnN0IGZsYWdzID0gW11cbiAgICAgICAgaWYgKGluZm8uZmxhZ3MubWF0Y2goL2EvKSkge1xuICAgICAgICAgIGZsYWdzLnB1c2goY3RzdHlsZShgWyR7Y2hhbGsucmVkLmJvbGQoJ09mZmVuc2l2ZScpfV1gKSlcbiAgICAgICAgICB0b2ZpbGUub2ZmZW5zaXZlID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmZvLmZsYWdzLm1hdGNoKC9iLykpIHtcbiAgICAgICAgICBmbGFncy5wdXNoKGN0c3R5bGUoJ1tGb3VuZCBpbiBkaWN0aW9uYXJ5XScpKVxuICAgICAgICAgIHRvZmlsZS5kaWN0ID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmZvLmZsYWdzLm1hdGNoKC9jLykpIHtcbiAgICAgICAgICBmbGFncy5wdXNoKGN0c3R5bGUoJ1tUcnVzdGVkIHByb251bmNpYXRpb24sIG5vdCBnZW5lcmF0ZWRdJykpXG4gICAgICAgICAgdG9maWxlLnRydXN0ZWQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ1dvcmQgRmxhZ3MnLCB0aGVtZSwgZmxhZ3Muam9pbignJykpXG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcucmJyYWluLmRhdGUucmVtYWlufS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ci5gKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW59LyR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLCB3aWxsIHJlc2V0IGluICR7NTkgLSBtaW51dGVzfSBtaW51dGVzLmApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y2hhbGsucmVkLmJvbGQoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTpgKX0gJHtjaGFsay5yZWQoZXJyb3IpfWApXG4gICAgICB9XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChgUmVhY2hlZCB0aGlzIGhvdXIncyB1c2FnZSBsaW1pdCBvZiAke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0uYCkpXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH1cbn1cbiJdfQ==