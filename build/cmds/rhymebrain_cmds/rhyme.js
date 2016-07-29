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
            if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
            if (reset) {
              console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour.');
            } else {
              console.log(config.rbrain.date.remain + '/' + config.rbrain.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQSxJQUFNLFNBQVMsUUFBUSxjQUFSLENBQWY7QUFDQSxJQUFNLFFBQVEsUUFBUSxhQUFSLENBQWQ7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiOztBQUVBLElBQU0sUUFBVyxRQUFRLEdBQVIsQ0FBWSxJQUF2QixxQkFBTjs7QUFFQSxRQUFRLE9BQVIsR0FBa0IsY0FBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxtQkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0seUJBRkY7QUFHSixhQUFTLElBSEw7QUFJSixVQUFNO0FBSkYsR0FuQlU7QUF5QmhCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLHVCQUZIO0FBR0gsYUFBUyxDQUhOO0FBSUgsVUFBTTtBQUpIO0FBekJXLENBQWxCO0FBZ0NBLFFBQVEsT0FBUixHQUFrQixVQUFDLElBQUQsRUFBVTtBQUMxQixRQUFNLFdBQU4sQ0FBa0IsS0FBbEI7QUFDQSxNQUFJLFNBQVMsS0FBSyxJQUFMLENBQVUsS0FBVixDQUFiO0FBQ0EsTUFBSSxVQUFVLEtBQWQ7QUFDQSxNQUFNLFFBQVEsSUFBSSxJQUFKLENBQVMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUE1QixDQUFkO0FBQ0EsTUFBTSxVQUFVLE9BQU8sSUFBSSxJQUFKLEVBQVAsRUFBaUIsSUFBakIsQ0FBc0IsS0FBdEIsRUFBNkIsU0FBN0IsQ0FBaEI7QUFDQSxNQUFJLFFBQVEsS0FBWjtBQUNBLE1BQUksVUFBVSxFQUFkLEVBQWtCO0FBQ2hCLFdBQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbkIsR0FBNEIsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFuQixHQUE0QixDQUF4RDtBQUNBLFNBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDRCxHQUhELE1BR08sSUFBSSxXQUFXLEVBQWYsRUFBbUI7QUFDeEIsWUFBUSxJQUFSO0FBQ0EsV0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUFuQixHQUEyQixTQUFTLE1BQVQsRUFBM0I7QUFDQSxXQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLE1BQW5CLEdBQTRCLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsS0FBL0M7QUFDQSxZQUFRLEdBQVIsQ0FBWSxNQUFNLEtBQU4seUJBQWtDLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsS0FBckQsU0FBOEQsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixRQUFqRixPQUFaO0FBQ0EsV0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFuQixHQUE0QixPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLE1BQW5CLEdBQTRCLENBQXhEO0FBQ0EsU0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUNEO0FBQ0QsTUFBSSxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLE1BQW5CLEtBQThCLENBQWxDLEVBQXFDO0FBQ25DLGNBQVUsS0FBVjtBQUNELEdBRkQsTUFFTyxJQUFJLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbkIsR0FBNEIsQ0FBaEMsRUFBbUM7QUFDeEMsY0FBVSxLQUFWO0FBQ0EsV0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFuQixHQUE0QixDQUE1QjtBQUNBLFNBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDRCxHQUpNLE1BSUE7QUFDTCxjQUFVLElBQVY7QUFDRDtBQUNELE1BQUksT0FBSixFQUFhO0FBQUE7QUFDWCxVQUFNLGFBQWE7QUFDakIsZ0JBQVE7QUFDTixpQkFBTztBQUNMLGtCQUFNLEtBQUssQ0FETjtBQUVMLGlCQUFLLEtBQUs7QUFGTDtBQUREO0FBRFMsT0FBbkI7QUFRQSxVQUFJLE9BQU8sS0FBWCxFQUFrQixTQUFTLEVBQUUsS0FBRixDQUFRLEVBQVIsRUFBWSxNQUFaLEVBQW9CLFVBQXBCLENBQVQ7QUFDbEIsVUFBTSxRQUFRLE9BQU8sU0FBUCxDQUFpQixPQUFPLEtBQXhCLENBQWQ7QUFDQSxVQUFJLE9BQU8sT0FBWCxFQUFvQixPQUFPLFNBQVAsQ0FBaUIsWUFBakIsRUFBK0IsS0FBL0IsRUFBc0MsSUFBdEM7QUFDcEIsVUFBTSxPQUFPLEtBQUssSUFBbEI7QUFDQSxVQUFNLE9BQU8sUUFBYjtBQUNBLFVBQU0sU0FBUyx5Q0FBZjtBQUNBLFVBQU0sV0FBUyxNQUFULEdBQWtCLElBQWxCLGNBQStCLElBQS9CLE1BQU47QUFDQSxVQUFNLFFBQVEsRUFBZDtBQUNBLFlBQU0sSUFBTixXQUFtQixPQUFPLE1BQVAsQ0FBYyxLQUFkLENBQW9CLElBQXZDO0FBQ0EsWUFBTSxJQUFOLGlCQUF5QixPQUFPLE1BQVAsQ0FBYyxLQUFkLENBQW9CLEdBQTdDO0FBQ0EsVUFBTSxPQUFPLE1BQU0sSUFBTixDQUFXLEVBQVgsQ0FBYjtBQUNBLFVBQUksV0FBUyxHQUFULEdBQWUsSUFBbkI7QUFDQSxZQUFNLFVBQVUsR0FBVixDQUFOO0FBQ0EsVUFBTSxTQUFTO0FBQ2IsY0FBTSxPQURPO0FBRWIsZ0JBQVEsdUJBRks7QUFHYjtBQUhhLE9BQWY7QUFLQSxVQUFNLFVBQVUsRUFBRSxHQUFGLENBQU0sS0FBTixFQUFhLE1BQU0sT0FBTixDQUFjLEtBQTNCLENBQWhCO0FBQ0EsYUFBTyxHQUFQLENBQVcsR0FBWCxFQUFnQixVQUFDLEtBQUQsRUFBUSxRQUFSLEVBQXFCO0FBQ25DLFlBQUksQ0FBQyxLQUFELElBQVUsU0FBUyxVQUFULEtBQXdCLEdBQXRDLEVBQTJDO0FBQUE7QUFDekMsZ0JBQU0sT0FBTyxTQUFTLElBQXRCO0FBQ0EsZ0JBQU0sUUFBUSxFQUFkO0FBQ0EsY0FBRSxJQUFGLENBQU8sSUFBUCxFQUFhLFVBQUMsSUFBRCxFQUFVO0FBQ3JCLG9CQUFNLElBQU4sQ0FBVyxLQUFLLElBQWhCO0FBQ0QsYUFGRDtBQUdBLGtCQUFNLElBQU4sQ0FBVyxVQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7QUFDbkIsa0JBQUksSUFBSSxDQUFSLEVBQVcsT0FBTyxDQUFDLENBQVI7QUFDWCxrQkFBSSxJQUFJLENBQVIsRUFBVyxPQUFPLENBQVA7QUFDWCxxQkFBTyxDQUFQO0FBQ0QsYUFKRDtBQUtBLGdCQUFNLFFBQVEsRUFBZDtBQUNBLGlCQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLEtBQUssTUFBTSxNQUFOLEdBQWUsQ0FBcEMsRUFBdUMsR0FBdkMsRUFBNEM7QUFDMUMsa0JBQU0sT0FBTyxNQUFNLENBQU4sQ0FBYjtBQUNBLG9CQUFNLElBQU4sQ0FBVyxRQUFRLElBQVIsQ0FBWDtBQUNBLGtCQUFJLEtBQUssS0FBTCxJQUFjLEdBQWxCLEVBQXVCO0FBQ3JCLHVCQUFPLGFBQVcsQ0FBWCxDQUFQLElBQTBCLElBQTFCO0FBQ0QsZUFGRCxNQUVPO0FBQ0wsdUJBQU8sV0FBUyxDQUFULENBQVAsSUFBd0IsSUFBeEI7QUFDRDtBQUNGO0FBQ0Qsa0JBQU0sSUFBTjtBQUNBLG1CQUFPLFVBQVAsQ0FBa0IsUUFBbEIsRUFBNEIsS0FBNUIsRUFBbUMsTUFBTSxJQUFOLENBQVcsSUFBWCxDQUFuQztBQUNBLGdCQUFJLEtBQUssQ0FBVCxFQUFZLE1BQU0sT0FBTixDQUFjLEtBQUssQ0FBbkIsRUFBc0IsS0FBSyxDQUEzQixFQUE4QixNQUE5QjtBQUNaLGdCQUFJLEtBQUssQ0FBTCxJQUFVLE9BQU8sS0FBckIsRUFBNEIsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM1QixnQkFBSSxLQUFLLENBQUwsSUFBVSxDQUFDLE9BQU8sS0FBdEIsRUFBNkIsUUFBUSxHQUFSLENBQVksTUFBTSxHQUFOLENBQVUsMkJBQVYsQ0FBWjtBQUM3QixnQkFBSSxLQUFKLEVBQVc7QUFDVCxzQkFBUSxHQUFSLENBQWUsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixNQUFsQyxTQUE0QyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLEtBQS9EO0FBQ0QsYUFGRCxNQUVPO0FBQ0wsc0JBQVEsR0FBUixDQUFlLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsTUFBbEMsU0FBNEMsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUEvRCxzREFBb0gsS0FBSyxPQUF6SDtBQUNEO0FBOUJ3QztBQStCMUMsU0EvQkQsTUErQk87QUFDTCxrQkFBUSxLQUFSLENBQWlCLE1BQU0sR0FBTixDQUFVLElBQVYsV0FBdUIsU0FBUyxVQUFoQyxPQUFqQixTQUFtRSxNQUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixPQW5DRDtBQTVCVztBQWdFWixHQWhFRCxNQWdFTztBQUNMLFlBQVEsS0FBUixDQUFjLE1BQU0sR0FBTiwwQ0FBZ0QsT0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixLQUFuRSxPQUFkO0FBQ0EsWUFBUSxJQUFSLENBQWEsQ0FBYjtBQUNEO0FBQ0YsQ0EvRkQiLCJmaWxlIjoiY21kcy9yaHltZWJyYWluX2NtZHMvcmh5bWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjowICovXG5jb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi8uLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuY29uc3QgbmVlZGxlID0gcmVxdWlyZSgnbmVlZGxlJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdyaHltZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnUmh5bWVicmFpbiByaHltZXMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGFuZzoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0lTTyA2MzktMSBsYW5ndWFnZSBjb2RlJyxcbiAgICBkZWZhdWx0OiAnZW4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBtYXg6IHtcbiAgICBhbGlhczogJ20nLFxuICAgIGRlc2M6ICdNYXggcmVzdWx0cyB0byByZXR1cm4nLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcClcbiAgY29uc3QgbWludXRlcyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBpZiAobWludXRlcyA8IDYwKSB7XG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSBpZiAobWludXRlcyA+PSA2MCkge1xuICAgIHJlc2V0ID0gdHJ1ZVxuICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdFxuICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBSZXNldCBBUEkgbGltaXQgdG8gJHtjb25maWcucmJyYWluLmRhdGUubGltaXR9LyR7Y29uZmlnLnJicmFpbi5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPCAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gICAgY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHJicmFpbjoge1xuICAgICAgICByaHltZToge1xuICAgICAgICAgIGxhbmc6IGFyZ3YubCxcbiAgICAgICAgICBtYXg6IGFyZ3YubSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICAgIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignUmh5bWVicmFpbicsIHRoZW1lLCBudWxsKVxuICAgIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgICBjb25zdCB0YXNrID0gJ1JoeW1lcydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL3JoeW1lYnJhaW4uY29tL3RhbGs/ZnVuY3Rpb249Z2V0J1xuICAgIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3Rhc2t9JndvcmQ9JHt3b3JkfSZgXG4gICAgY29uc3QgcGNvbnQgPSBbXVxuICAgIHBjb250LnB1c2goYGxhbmc9JHtjb25maWcucmJyYWluLnJoeW1lLmxhbmd9JmApXG4gICAgcGNvbnQucHVzaChgbWF4UmVzdWx0cz0ke2NvbmZpZy5yYnJhaW4ucmh5bWUubWF4fSZgKVxuICAgIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICAgIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIGNvbnN0IHRvZmlsZSA9IHtcbiAgICAgIHR5cGU6ICdyaHltZScsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vcmh5bWVicmFpbi5jb20nLFxuICAgICAgdXJsLFxuICAgIH1cbiAgICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gICAgbmVlZGxlLmdldCh1cmwsIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSByZXNwb25zZS5ib2R5XG4gICAgICAgIGNvbnN0IGxjb250ID0gW11cbiAgICAgICAgXy5lYWNoKGxpc3QsIChpdGVtKSA9PiB7XG4gICAgICAgICAgbGNvbnQucHVzaChpdGVtLndvcmQpXG4gICAgICAgIH0pXG4gICAgICAgIGxjb250LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICBpZiAoYSA8IGIpIHJldHVybiAtMVxuICAgICAgICAgIGlmIChhID4gYikgcmV0dXJuIDFcbiAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9KVxuICAgICAgICBjb25zdCByY29udCA9IFtdXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IGxjb250Lmxlbmd0aCAtIDE7IGorKykge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsY29udFtqXVxuICAgICAgICAgIHJjb250LnB1c2goY3RzdHlsZShpdGVtKSlcbiAgICAgICAgICBpZiAoaXRlbS5zY29yZSA+PSAzMDApIHtcbiAgICAgICAgICAgIHRvZmlsZVtbYGhpc2NvcmUke2p9YF1dID0gaXRlbVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b2ZpbGVbW2ByaHltZSR7an1gXV0gPSBpdGVtXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJjb250LnNvcnQoKVxuICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnUmh5bWVzJywgdGhlbWUsIHJjb250LmpvaW4oJywgJykpXG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcucmJyYWluLmRhdGUucmVtYWlufS8ke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ci5gKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2NvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW59LyR7Y29uZmlnLnJicmFpbi5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLCB3aWxsIHJlc2V0IGluICR7NTkgLSBtaW51dGVzfSBtaW51dGVzLmApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y2hhbGsucmVkLmJvbGQoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTpgKX0gJHtjaGFsay5yZWQoZXJyb3IpfWApXG4gICAgICB9XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChgUmVhY2hlZCB0aGlzIGhvdXIncyB1c2FnZSBsaW1pdCBvZiAke2NvbmZpZy5yYnJhaW4uZGF0ZS5saW1pdH0uYCkpXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH1cbn1cbiJdfQ==