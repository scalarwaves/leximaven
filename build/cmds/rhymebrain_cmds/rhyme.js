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
  var now = moment(new Date()).diff(stamp, 'minutes');
  var diff = 60 - now;
  var reset = false;
  if (diff < 60) {
    config.rbrain.date.remain = config.rbrain.date.remain - 1;
    noon.save(CFILE, config);
  } else if (diff >= 60) {
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
      needle.get(url, function (error, response) {
        if (!error && response.statusCode === 200) {
          (function () {
            var list = response.body;
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
              rcont.push(ctstyle('' + item.word));
              if (item.score >= 300) {
                tofile[['hiscore' + j]] = item.word;
              } else {
                tofile[['rhyme' + j]] = item.word;
              }
            }
            rcont.sort();
            themes.labelRight('Rhymes', theme, rcont.join(', '));
            if (argv.o) tools.outFile(argv.o, argv.f, tofile);
            if (argv.s && config.merge) noon.save(CFILE, config);
            if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
            if (reset) {
              console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.');
            } else {
              console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + diff + ' minutes.');
            }
          })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQSxJQUFNLFNBQVMsUUFBUSxjQUFSLENBQWY7QUFDQSxJQUFNLFFBQVEsUUFBUSxhQUFSLENBQWQ7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiOztBQUVBLElBQU0sUUFBVyxRQUFRLEdBQVIsQ0FBWSxJQUF2QixxQkFBTjs7QUFFQSxRQUFRLE9BQVIsR0FBa0IsY0FBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxtQkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0seUJBRkY7QUFHSixhQUFTLElBSEw7QUFJSixVQUFNO0FBSkYsR0FuQlU7QUF5QmhCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLHVCQUZIO0FBR0gsYUFBUyxDQUhOO0FBSUgsVUFBTTtBQUpIO0FBekJXLENBQWxCO0FBZ0NBLFFBQVEsT0FBUixHQUFrQixVQUFDLElBQUQsRUFBVTtBQUMxQixRQUFNLFdBQU4sQ0FBa0IsS0FBbEI7QUFDQSxNQUFJLFNBQVMsS0FBSyxJQUFM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Q0FBVCxFQUFZLE1BQU0sT0FBTixDQUFjLEtBQUssQ0FBbkIsRUFBc0IsS0FBSyxDQUEzQixFQUE4QixNQUE5QjtBQUNaLGdCQUFJLEtBQUssQ0FBTCxJQUFVLE9BQU8sS0FBckIsRUFBNEIsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM1QixnQkFBSSxLQUFLLENBQUwsSUFBVSxDQUFDLE9BQU8sS0FBdEIsRUFBNkIsUUFBUSxHQUFSLENBQVksTUFBTSxHQUFOLENBQVUsMkJBQVYsQ0FBWjtBQUM3QixnQkFBSSxLQUFKLEVBQVc7QUFDVCxzQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9EO0FBQ0QsYUFGRCxNQUVPO0FBQ0wsc0JBQVEsR0FBUixDQUFlLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbEMsU0FBNEMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUEvRCxxREFBb0gsSUFBcEg7QUFDRDtBQTlCd0M7QUErQjFDLFNBL0JELE1BK0JPO0FBQ0wsa0JBQVEsS0FBUixDQUFpQixNQUFNLEdBQU4sQ0FBVSxJQUFWLFdBQXVCLFNBQVMsVUFBaEMsT0FBakIsU0FBbUUsTUFBTSxHQUFOLENBQVUsS0FBVixDQUFuRTtBQUNEO0FBQ0YsT0FuQ0Q7QUE1Qlc7QUFnRVosR0FoRUQsTUFnRU87QUFDTCxZQUFRLEtBQVIsQ0FBYyxNQUFNLEdBQU4sMENBQWdELE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsS0FBbkUsT0FBZDtBQUNBLFlBQVEsSUFBUixDQUFhLENBQWI7QUFDRDtBQUNGLENBaEdEIiwiZmlsZSI6ImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcbmNvbnN0IG5lZWRsZSA9IHJlcXVpcmUoJ25lZWRsZScpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAncmh5bWUgPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ1JoeW1lYnJhaW4gcmh5bWVzJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxhbmc6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdJU08gNjM5LTEgbGFuZ3VhZ2UgY29kZScsXG4gICAgZGVmYXVsdDogJ2VuJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgbWF4OiB7XG4gICAgYWxpYXM6ICdtJyxcbiAgICBkZXNjOiAnTWF4IHJlc3VsdHMgdG8gcmV0dXJuJyxcbiAgICBkZWZhdWx0OiA1LFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGxldCBwcm9jZWVkID0gZmFsc2VcbiAgY29uc3Qgc3RhbXAgPSBuZXcgRGF0ZShjb25maWcucmJyYWluLmRhdGUuc3RhbXApXG4gIGNvbnN0IG5vdyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBjb25zdCBkaWZmID0gNjAgLSBub3dcbiAgbGV0IHJlc2V0ID0gZmFsc2VcbiAgaWYgKGRpZmYgPCA2MCkge1xuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSBjb25maWcucmJyYWluLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKGRpZmYgPj0gNjApIHtcbiAgICByZXNldCA9IHRydWVcbiAgICBjb25maWcucmJyYWluLmRhdGUuc3RhbXAgPSBtb21lbnQoKS5mb3JtYXQoKVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSBjb25maWcucmJyYWluLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5pbnRlcnZhbH0uYCkpXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH1cbiAgaWYgKGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPT09IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgfSBlbHNlIGlmIChjb25maWcucmJyYWluLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSAwXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSB7XG4gICAgcHJvY2VlZCA9IHRydWVcbiAgfVxuICBpZiAocHJvY2VlZCkge1xuICAgIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgICByYnJhaW46IHtcbiAgICAgICAgcmh5bWU6IHtcbiAgICAgICAgICBsYW5nOiBhcmd2LmwsXG4gICAgICAgICAgbWF4OiBhcmd2Lm0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1JoeW1lYnJhaW4nLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdSaHltZXMnXG4gICAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly9yaHltZWJyYWluLmNvbS90YWxrP2Z1bmN0aW9uPWdldCdcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt0YXNrfSZ3b3JkPSR7d29yZH0mYFxuICAgIGNvbnN0IHBjb250ID0gW11cbiAgICBwY29udC5wdXNoKGBsYW5nPSR7Y29uZmlnLnJicmFpbi5yaHltZS5sYW5nfSZgKVxuICAgIHBjb250LnB1c2goYG1heFJlc3VsdHM9JHtjb25maWcucmJyYWluLnJoeW1lLm1heH0mYClcbiAgICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgICBsZXQgdXJsID0gYCR7dXJpfSR7cmVzdH1gXG4gICAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgICB0eXBlOiAncmh5bWUnLFxuICAgICAgc291cmNlOiAnaHR0cDovL3JoeW1lYnJhaW4uY29tJyxcbiAgICAgIHVybCxcbiAgICB9XG4gICAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICAgIG5lZWRsZS5nZXQodXJsLCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gcmVzcG9uc2UuYm9keVxuICAgICAgICBjb25zdCBsY29udCA9IFtdXG4gICAgICAgIF8uZWFjaChsaXN0LCAoaXRlbSkgPT4ge1xuICAgICAgICAgIGxjb250LnB1c2goaXRlbS53b3JkKVxuICAgICAgICB9KVxuICAgICAgICBsY29udC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgaWYgKGEgPCBiKSByZXR1cm4gLTFcbiAgICAgICAgICBpZiAoYSA+IGIpIHJldHVybiAxXG4gICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgcmNvbnQgPSBbXVxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8PSBsY29udC5sZW5ndGggLSAxOyBqKyspIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gbGNvbnRbal1cbiAgICAgICAgICByY29udC5wdXNoKGN0c3R5bGUoYCR7aXRlbS53b3JkfWApKVxuICAgICAgICAgIGlmIChpdGVtLnNjb3JlID49IDMwMCkge1xuICAgICAgICAgICAgdG9maWxlW1tgaGlzY29yZSR7an1gXV0gPSBpdGVtLndvcmRcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9maWxlW1tgcmh5bWUke2p9YF1dID0gaXRlbS53b3JkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJjb250LnNvcnQoKVxuICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnUmh5bWVzJywgdGhlbWUsIHJjb250LmpvaW4oJywgJykpXG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcucmJyYWluLmRhdGUucmVtYWlufS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ci5gKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW59LyR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLCB3aWxsIHJlc2V0IGluICR7ZGlmZn0gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYFJlYWNoZWQgdGhpcyBob3VyJ3MgdXNhZ2UgbGltaXQgb2YgJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9LmApKVxuICAgIHByb2Nlc3MuZXhpdCgxKVxuICB9XG59XG4iXX0=