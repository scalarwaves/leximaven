'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var chalk = require('chalk');
var moment = require('moment');
var http = require('good-guy-http')();
var noon = require('noon');
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'onelook <word>';
exports.desc = 'Onelook definitions';
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
  links: {
    alias: 'l',
    desc: 'Include resource links',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var stamp = new Date(config.onelook.date.stamp);
  var hours = moment(new Date()).diff(stamp, 'hours');
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var reset = false;
  if (hours < 24 || hours < 0) {
    config.onelook.date.remain = config.onelook.date.remain - 1;
    noon.save(CFILE, config);
  } else if (hours >= 24) {
    reset = true;
    config.onelook.date.stamp = moment().format();
    config.onelook.date.remain = config.onelook.date.limit;
    console.log(chalk.white('Reset API limit to ' + config.onelook.date.limit + '/' + config.onelook.date.interval + '.'));
    config.onelook.date.remain = config.onelook.date.remain - 1;
    noon.save(CFILE, config);
  }
  if (config.onelook.date.remain === 0) {
    proceed = false;
  } else if (config.onelook.date.remain < 0) {
    proceed = false;
    config.onelook.date.remain = 0;
    noon.save(CFILE, config);
  } else {
    proceed = true;
  }
  if (proceed) {
    (function () {
      var userConfig = {
        onelook: {
          links: argv.l
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Onelook', theme, null);
      var url = 'http://onelook.com/?xml=1&w=' + argv.word;
      url = encodeURI(url);
      var tofile = {
        type: 'onelook',
        source: 'http://www.onelook.com',
        url: url
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var body = response.body;
          var parser = new xml2js.Parser();
          parser.parseString(body, function (err, result) {
            var resp = result.OLResponse;
            var phrase = resp.OLPhrases[0];
            var similar = resp.OLSimilar[0];
            var quickdef = resp.OLQuickDef;
            var resources = resp.OLRes;
            themes.labelDown('Definition', theme, null);
            if (Array.isArray(quickdef) && quickdef.length > 1) {
              for (var i = 0; i <= quickdef.length - 1; i++) {
                var item = quickdef[i];
                item = item.replace(/&lt;|&gt;|\n|\/i/g, '');
                item = item.replace(/i"/g, '"');
                console.log(ctstyle(item));
                tofile[['definition' + i]] = item;
              }
            } else {
              var definition = quickdef[0].replace(/&lt;|&gt;|\n|\/i/g, '');
              console.log(ctstyle(definition));
              tofile.definition = definition;
            }
            if (phrase) {
              var phrases = phrase.replace(/\n/g, '');
              themes.labelDown('Phrases', theme, phrases);
              tofile.phrase = phrases;
            }
            if (similar) {
              var sim = similar.replace(/\n/g, '');
              themes.labelDown('Similar', theme, sim);
              tofile.sim = sim;
            }
            if (config.onelook.links) {
              themes.labelDown('Resources', theme, null);
              for (var _i = 0; _i <= resources.length - 1; _i++) {
                var _item = resources[_i];
                var res = _item.OLResName.replace(/\n/g, '');
                var link = _item.OLResLink.replace(/\n/g, '');
                themes.labelRight(res, theme, link);
                tofile[['res' + _i]] = res;
                tofile[['link' + _i]] = link;
              }
            }
            if (argv.o) tools.outFile(argv.o, argv.f, tofile);
            if (argv.s && config.merge) noon.save(CFILE, config);
            if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
            if (reset) {
              console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today.');
            } else {
              console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today, will reset in ' + (23 - hours) + ' hours, ' + (59 - minutes) + ' minutes.');
            }
          });
        } else {
          throw new Error('HTTP ' + response.statusCode + ' ' + error);
        }
      });
    })();
  } else {
    throw new Error('Reached today\'s usage limit of ' + config.onelook.date.limit + '.');
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvb25lbG9vay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsV0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsVUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGdCQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHFCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSx3QkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRDtBQW5CUyxDQUFsQjtBQTBCQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQUksVUFBVSxLQUFkO0FBQ0EsTUFBTSxRQUFRLElBQUksSUFBSixDQUFTLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBN0IsQ0FBZDtBQUNBLE1BQU0sUUFBUSxPQUFPLElBQUksSUFBSixFQUFQLEVBQWlCLElBQWpCLENBQXNCLEtBQXRCLEVBQTZCLE9BQTdCLENBQWQ7QUFDQSxNQUFNLFVBQVUsT0FBTyxJQUFJLElBQUosRUFBUCxFQUFpQixJQUFqQixDQUFzQixLQUF0QixFQUE2QixTQUE3QixDQUFoQjtBQUNBLE1BQUksUUFBUSxLQUFaO0FBQ0EsTUFBSSxRQUFRLEVBQVIsSUFBYyxRQUFRLENBQTFCLEVBQTZCO0FBQzNCLFdBQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBcEIsR0FBNkIsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFwQixHQUE2QixDQUExRDtBQUNBLFNBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDRCxHQUhELE1BR08sSUFBSSxTQUFTLEVBQWIsRUFBaUI7QUFDdEIsWUFBUSxJQUFSO0FBQ0EsV0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFwQixHQUE0QixTQUFTLE1BQVQsRUFBNUI7QUFDQSxXQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQXBCLEdBQTZCLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBakQ7QUFDQSxZQUFRLEdBQVIsQ0FBWSxNQUFNLEtBQU4seUJBQWtDLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBdEQsU0FBK0QsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixRQUFuRixPQUFaO0FBQ0EsV0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFwQixHQUE2QixPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQXBCLEdBQTZCLENBQTFEO0FBQ0EsU0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUNEO0FBQ0QsTUFBSSxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQXBCLEtBQStCLENBQW5DLEVBQXNDO0FBQ3BDLGNBQVUsS0FBVjtBQUNELEdBRkQsTUFFTyxJQUFJLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBcEIsR0FBNkIsQ0FBakMsRUFBb0M7QUFDekMsY0FBVSxLQUFWO0FBQ0EsV0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFwQixHQUE2QixDQUE3QjtBQUNBLFNBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDRCxHQUpNLE1BSUE7QUFDTCxjQUFVLElBQVY7QUFDRDtBQUNELE1BQUksT0FBSixFQUFhO0FBQUE7QUFDWCxVQUFNLGFBQWE7QUFDakIsaUJBQVM7QUFDUCxpQkFBTyxLQUFLO0FBREw7QUFEUSxPQUFuQjtBQUtBLFVBQUksT0FBTyxLQUFYLEVBQWtCLFNBQVMsRUFBRSxLQUFGLENBQVEsRUFBUixFQUFZLE1BQVosRUFBb0IsVUFBcEIsQ0FBVDtBQUNsQixVQUFNLFFBQVEsT0FBTyxTQUFQLENBQWlCLE9BQU8sS0FBeEIsQ0FBZDtBQUNBLFVBQUksT0FBTyxPQUFYLEVBQW9CLE9BQU8sU0FBUCxDQUFpQixTQUFqQixFQUE0QixLQUE1QixFQUFtQyxJQUFuQztBQUNwQixVQUFJLHVDQUFxQyxLQUFLLElBQTlDO0FBQ0EsWUFBTSxVQUFVLEdBQVYsQ0FBTjtBQUNBLFVBQU0sU0FBUztBQUNiLGNBQU0sU0FETztBQUViLGdCQUFRLHdCQUZLO0FBR2I7QUFIYSxPQUFmO0FBS0EsVUFBTSxVQUFVLEVBQUUsR0FBRixDQUFNLEtBQU4sRUFBYSxNQUFNLE9BQU4sQ0FBYyxLQUEzQixDQUFoQjtBQUNBLFdBQUssRUFBRSxRQUFGLEVBQUwsRUFBYyxVQUFDLEtBQUQsRUFBUSxRQUFSLEVBQXFCO0FBQ2pDLFlBQUksQ0FBQyxLQUFELElBQVUsU0FBUyxVQUFULEtBQXdCLEdBQXRDLEVBQTJDO0FBQ3pDLGNBQU0sT0FBTyxTQUFTLElBQXRCO0FBQ0EsY0FBTSxTQUFTLElBQUksT0FBTyxNQUFYLEVBQWY7QUFDQSxpQkFBTyxXQUFQLENBQW1CLElBQW5CLEVBQXlCLFVBQUMsR0FBRCxFQUFNLE1BQU4sRUFBaUI7QUFDeEMsZ0JBQU0sT0FBTyxPQUFPLFVBQXBCO0FBQ0EsZ0JBQU0sU0FBUyxLQUFLLFNBQUwsQ0FBZSxDQUFmLENBQWY7QUFDQSxnQkFBTSxVQUFVLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBaEI7QUFDQSxnQkFBTSxXQUFXLEtBQUssVUFBdEI7QUFDQSxnQkFBTSxZQUFZLEtBQUssS0FBdkI7QUFDQSxtQkFBTyxTQUFQLENBQWlCLFlBQWpCLEVBQStCLEtBQS9CLEVBQXNDLElBQXRDO0FBQ0EsZ0JBQUksTUFBTSxPQUFOLENBQWMsUUFBZCxLQUEyQixTQUFTLE1BQVQsR0FBa0IsQ0FBakQsRUFBb0Q7QUFDbEQsbUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsS0FBSyxTQUFTLE1BQVQsR0FBa0IsQ0FBdkMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDN0Msb0JBQUksT0FBTyxTQUFTLENBQVQsQ0FBWDtBQUNBLHVCQUFPLEtBQUssT0FBTCxDQUFhLG1CQUFiLEVBQWtDLEVBQWxDLENBQVA7QUFDQSx1QkFBTyxLQUFLLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEdBQXBCLENBQVA7QUFDQSx3QkFBUSxHQUFSLENBQVksUUFBUSxJQUFSLENBQVo7QUFDQSx1QkFBTyxnQkFBYyxDQUFkLENBQVAsSUFBNkIsSUFBN0I7QUFDRDtBQUNGLGFBUkQsTUFRTztBQUNMLGtCQUFNLGFBQWEsU0FBUyxDQUFULEVBQVksT0FBWixDQUFvQixtQkFBcEIsRUFBeUMsRUFBekMsQ0FBbkI7QUFDQSxzQkFBUSxHQUFSLENBQVksUUFBUSxVQUFSLENBQVo7QUFDQSxxQkFBTyxVQUFQLEdBQW9CLFVBQXBCO0FBQ0Q7QUFDRCxnQkFBSSxNQUFKLEVBQVk7QUFDVixrQkFBTSxVQUFVLE9BQU8sT0FBUCxDQUFlLEtBQWYsRUFBc0IsRUFBdEIsQ0FBaEI7QUFDQSxxQkFBTyxTQUFQLENBQWlCLFNBQWpCLEVBQTRCLEtBQTVCLEVBQW1DLE9BQW5DO0FBQ0EscUJBQU8sTUFBUCxHQUFnQixPQUFoQjtBQUNEO0FBQ0QsZ0JBQUksT0FBSixFQUFhO0FBQ1gsa0JBQU0sTUFBTSxRQUFRLE9BQVIsQ0FBZ0IsS0FBaEIsRUFBdUIsRUFBdkIsQ0FBWjtBQUNBLHFCQUFPLFNBQVAsQ0FBaUIsU0FBakIsRUFBNEIsS0FBNUIsRUFBbUMsR0FBbkM7QUFDQSxxQkFBTyxHQUFQLEdBQWEsR0FBYjtBQUNEO0FBQ0QsZ0JBQUksT0FBTyxPQUFQLENBQWUsS0FBbkIsRUFBMEI7QUFDeEIscUJBQU8sU0FBUCxDQUFpQixXQUFqQixFQUE4QixLQUE5QixFQUFxQyxJQUFyQztBQUNBLG1CQUFLLElBQUksS0FBSSxDQUFiLEVBQWdCLE1BQUssVUFBVSxNQUFWLEdBQW1CLENBQXhDLEVBQTJDLElBQTNDLEVBQWdEO0FBQzlDLG9CQUFNLFFBQU8sVUFBVSxFQUFWLENBQWI7QUFDQSxvQkFBTSxNQUFNLE1BQUssU0FBTCxDQUFlLE9BQWYsQ0FBdUIsS0FBdkIsRUFBOEIsRUFBOUIsQ0FBWjtBQUNBLG9CQUFNLE9BQU8sTUFBSyxTQUFMLENBQWUsT0FBZixDQUF1QixLQUF2QixFQUE4QixFQUE5QixDQUFiO0FBQ0EsdUJBQU8sVUFBUCxDQUFrQixHQUFsQixFQUF1QixLQUF2QixFQUE4QixJQUE5QjtBQUNBLHVCQUFPLFNBQU8sRUFBUCxDQUFQLElBQXNCLEdBQXRCO0FBQ0EsdUJBQU8sVUFBUSxFQUFSLENBQVAsSUFBdUIsSUFBdkI7QUFDRDtBQUNGO0FBQ0QsZ0JBQUksS0FBSyxDQUFULEVBQVksTUFBTSxPQUFOLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCLEVBQThCLE1BQTlCO0FBQ1osZ0JBQUksS0FBSyxDQUFMLElBQVUsT0FBTyxLQUFyQixFQUE0QixLQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO0FBQzVCLGdCQUFJLEtBQUssQ0FBTCxJQUFVLENBQUMsT0FBTyxLQUF0QixFQUE2QixRQUFRLEdBQVIsQ0FBWSxNQUFNLEdBQU4sQ0FBVSwyQkFBVixDQUFaO0FBQzdCLGdCQUFJLEtBQUosRUFBVztBQUNULHNCQUFRLEdBQVIsQ0FBZSxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQW5DLFNBQTZDLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBakU7QUFDRCxhQUZELE1BRU87QUFDTCxzQkFBUSxHQUFSLENBQWUsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFuQyxTQUE2QyxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQWpFLGtEQUFrSCxLQUFLLEtBQXZILGtCQUF1SSxLQUFLLE9BQTVJO0FBQ0Q7QUFDRixXQWpERDtBQWtERCxTQXJERCxNQXFETztBQUNMLGdCQUFNLElBQUksS0FBSixXQUFrQixTQUFTLFVBQTNCLFNBQXlDLEtBQXpDLENBQU47QUFDRDtBQUNGLE9BekREO0FBakJXO0FBMkVaLEdBM0VELE1BMkVPO0FBQ0wsVUFBTSxJQUFJLEtBQUosc0NBQTRDLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBaEUsT0FBTjtBQUNEO0FBQ0YsQ0ExR0QiLCJmaWxlIjoiY21kcy9vbmVsb29rLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdnb29kLWd1eS1odHRwJykoKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuY29uc3QgeG1sMmpzID0gcmVxdWlyZSgneG1sMmpzJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdvbmVsb29rIDx3b3JkPidcbmV4cG9ydHMuZGVzYyA9ICdPbmVsb29rIGRlZmluaXRpb25zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbmtzOiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnSW5jbHVkZSByZXNvdXJjZSBsaW5rcycsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGxldCBwcm9jZWVkID0gZmFsc2VcbiAgY29uc3Qgc3RhbXAgPSBuZXcgRGF0ZShjb25maWcub25lbG9vay5kYXRlLnN0YW1wKVxuICBjb25zdCBob3VycyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ2hvdXJzJylcbiAgY29uc3QgbWludXRlcyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBpZiAoaG91cnMgPCAyNCB8fCBob3VycyA8IDApIHtcbiAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKGhvdXJzID49IDI0KSB7XG4gICAgcmVzZXQgPSB0cnVlXG4gICAgY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW4gPSBjb25maWcub25lbG9vay5kYXRlLmxpbWl0XG4gICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYFJlc2V0IEFQSSBsaW1pdCB0byAke2NvbmZpZy5vbmVsb29rLmRhdGUubGltaXR9LyR7Y29uZmlnLm9uZWxvb2suZGF0ZS5pbnRlcnZhbH0uYCkpXG4gICAgY29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW4gPSBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW4gPT09IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgfSBlbHNlIGlmIChjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA8IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIG9uZWxvb2s6IHtcbiAgICAgICAgbGlua3M6IGFyZ3YubCxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICAgIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignT25lbG9vaycsIHRoZW1lLCBudWxsKVxuICAgIGxldCB1cmwgPSBgaHR0cDovL29uZWxvb2suY29tLz94bWw9MSZ3PSR7YXJndi53b3JkfWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIGNvbnN0IHRvZmlsZSA9IHtcbiAgICAgIHR5cGU6ICdvbmVsb29rJyxcbiAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cub25lbG9vay5jb20nLFxuICAgICAgdXJsLFxuICAgIH1cbiAgICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gICAgaHR0cCh7IHVybCB9LCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIWVycm9yICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBib2R5ID0gcmVzcG9uc2UuYm9keVxuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgeG1sMmpzLlBhcnNlcigpXG4gICAgICAgIHBhcnNlci5wYXJzZVN0cmluZyhib2R5LCAoZXJyLCByZXN1bHQpID0+IHtcbiAgICAgICAgICBjb25zdCByZXNwID0gcmVzdWx0Lk9MUmVzcG9uc2VcbiAgICAgICAgICBjb25zdCBwaHJhc2UgPSByZXNwLk9MUGhyYXNlc1swXVxuICAgICAgICAgIGNvbnN0IHNpbWlsYXIgPSByZXNwLk9MU2ltaWxhclswXVxuICAgICAgICAgIGNvbnN0IHF1aWNrZGVmID0gcmVzcC5PTFF1aWNrRGVmXG4gICAgICAgICAgY29uc3QgcmVzb3VyY2VzID0gcmVzcC5PTFJlc1xuICAgICAgICAgIHRoZW1lcy5sYWJlbERvd24oJ0RlZmluaXRpb24nLCB0aGVtZSwgbnVsbClcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShxdWlja2RlZikgJiYgcXVpY2tkZWYubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gcXVpY2tkZWYubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tkZWZbaV1cbiAgICAgICAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvJmx0O3wmZ3Q7fFxcbnxcXC9pL2csICcnKVxuICAgICAgICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9pXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coY3RzdHlsZShpdGVtKSlcbiAgICAgICAgICAgICAgdG9maWxlW1tgZGVmaW5pdGlvbiR7aX1gXV0gPSBpdGVtXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBxdWlja2RlZlswXS5yZXBsYWNlKC8mbHQ7fCZndDt8XFxufFxcL2kvZywgJycpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGRlZmluaXRpb24pKVxuICAgICAgICAgICAgdG9maWxlLmRlZmluaXRpb24gPSBkZWZpbml0aW9uXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwaHJhc2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHBocmFzZXMgPSBwaHJhc2UucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgICAgdGhlbWVzLmxhYmVsRG93bignUGhyYXNlcycsIHRoZW1lLCBwaHJhc2VzKVxuICAgICAgICAgICAgdG9maWxlLnBocmFzZSA9IHBocmFzZXNcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNpbWlsYXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpbSA9IHNpbWlsYXIucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgICAgdGhlbWVzLmxhYmVsRG93bignU2ltaWxhcicsIHRoZW1lLCBzaW0pXG4gICAgICAgICAgICB0b2ZpbGUuc2ltID0gc2ltXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjb25maWcub25lbG9vay5saW5rcykge1xuICAgICAgICAgICAgdGhlbWVzLmxhYmVsRG93bignUmVzb3VyY2VzJywgdGhlbWUsIG51bGwpXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSByZXNvdXJjZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSByZXNvdXJjZXNbaV1cbiAgICAgICAgICAgICAgY29uc3QgcmVzID0gaXRlbS5PTFJlc05hbWUucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgICAgICBjb25zdCBsaW5rID0gaXRlbS5PTFJlc0xpbmsucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodChyZXMsIHRoZW1lLCBsaW5rKVxuICAgICAgICAgICAgICB0b2ZpbGVbW2ByZXMke2l9YF1dID0gcmVzXG4gICAgICAgICAgICAgIHRvZmlsZVtbYGxpbmske2l9YF1dID0gbGlua1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICAgIGlmIChhcmd2LnMgJiYgIWNvbmZpZy5tZXJnZSkgY29uc29sZS5lcnIoY2hhbGsucmVkKCdTZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUhJykpXG4gICAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcub25lbG9vay5kYXRlLnJlbWFpbn0vJHtjb25maWcub25lbG9vay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdG9kYXkuYClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW59LyR7Y29uZmlnLm9uZWxvb2suZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRvZGF5LCB3aWxsIHJlc2V0IGluICR7MjMgLSBob3Vyc30gaG91cnMsICR7NTkgLSBtaW51dGVzfSBtaW51dGVzLmApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX0gJHtlcnJvcn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRvZGF5J3MgdXNhZ2UgbGltaXQgb2YgJHtjb25maWcub25lbG9vay5kYXRlLmxpbWl0fS5gKVxuICB9XG59XG4iXX0=