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
  var reset = false;
  var stamp = new Date(config.onelook.date.stamp);
  var hours = moment(new Date()).diff(stamp, 'hours');
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var checkStamp = tools.limitOnelook(config);
  config = checkStamp[0];
  proceed = checkStamp[1];
  reset = checkStamp[2];
  if (proceed) {
    (function () {
      var userConfig = {
        onelook: {
          links: argv.l
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Onelook');
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
            themes.label(theme, 'down', 'Definition');
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
              themes.label(theme, 'down', 'Phrases', phrases);
              tofile.phrase = phrases;
            }
            if (similar) {
              var sim = similar.replace(/\n/g, '');
              themes.label(theme, 'down', 'Similar', sim);
              tofile.sim = sim;
            }
            if (config.onelook.links) {
              themes.label(theme, 'down', 'Resources');
              for (var _i = 0; _i <= resources.length - 1; _i++) {
                var _item = resources[_i];
                var res = tools.arrToStr(_item.OLResName).replace(/\n/g, '');
                var link = tools.arrToStr(_item.OLResLink).replace(/\n/g, '');
                var home = tools.arrToStr(_item.OLResHomeLink).replace(/\n/g, '');
                themes.label(theme, 'right', res, link);
                tofile[['res' + _i]] = res;
                tofile[['link' + _i]] = link;
                tofile[['home' + _i]] = home;
              }
            }
            if (argv.o) tools.outFile(argv.o, argv.f, tofile);
            if (argv.s && config.merge) noon.save(CFILE, config);
            if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
            if (reset) {
              console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today.');
            } else {
              if (config.usage) console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today, will reset in ' + (23 - hours) + ' hours, ' + (59 - minutes) + ' minutes.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvb25lbG9vay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsV0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsVUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGdCQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLHFCQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQsR0FQUztBQWFoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSwyQkFGRjtBQUdKLGFBQVMsS0FITDtBQUlKLFVBQU07QUFKRixHQWJVO0FBbUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSx3QkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRDtBQW5CUyxDQUFsQjtBQTBCQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQUksVUFBVSxLQUFkO0FBQ0EsTUFBSSxRQUFRLEtBQVo7QUFDQSxNQUFNLFFBQVEsSUFBSSxJQUFKLENBQVMsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUE3QixDQUFkO0FBQ0EsTUFBTSxRQUFRLE9BQU8sSUFBSSxJQUFKLEVBQVAsRUFBaUIsSUFBakIsQ0FBc0IsS0FBdEIsRUFBNkIsT0FBN0IsQ0FBZDtBQUNBLE1BQU0sVUFBVSxPQUFPLElBQUksSUFBSixFQUFQLEVBQWlCLElBQWpCLENBQXNCLEtBQXRCLEVBQTZCLFNBQTdCLENBQWhCO0FBQ0EsTUFBTSxhQUFhLE1BQU0sWUFBTixDQUFtQixNQUFuQixDQUFuQjtBQUNBLFdBQVMsV0FBVyxDQUFYLENBQVQ7QUFDQSxZQUFVLFdBQVcsQ0FBWCxDQUFWO0FBQ0EsVUFBUSxXQUFXLENBQVgsQ0FBUjtBQUNBLE1BQUksT0FBSixFQUFhO0FBQUE7QUFDWCxVQUFNLGFBQWE7QUFDakIsaUJBQVM7QUFDUCxpQkFBTyxLQUFLO0FBREw7QUFEUSxPQUFuQjtBQUtBLFVBQUksT0FBTyxLQUFYLEVBQWtCLFNBQVMsRUFBRSxLQUFGLENBQVEsRUFBUixFQUFZLE1BQVosRUFBb0IsVUFBcEIsQ0FBVDtBQUNsQixVQUFNLFFBQVEsT0FBTyxTQUFQLENBQWlCLE9BQU8sS0FBeEIsQ0FBZDtBQUNBLFVBQUksT0FBTyxPQUFYLEVBQW9CLE9BQU8sS0FBUCxDQUFhLEtBQWIsRUFBb0IsTUFBcEIsRUFBNEIsU0FBNUI7QUFDcEIsVUFBSSx1Q0FBcUMsS0FBSyxJQUE5QztBQUNBLFlBQU0sVUFBVSxHQUFWLENBQU47QUFDQSxVQUFNLFNBQVM7QUFDYixjQUFNLFNBRE87QUFFYixnQkFBUSx3QkFGSztBQUdiO0FBSGEsT0FBZjtBQUtBLFVBQU0sVUFBVSxFQUFFLEdBQUYsQ0FBTSxLQUFOLEVBQWEsTUFBTSxPQUFOLENBQWMsS0FBM0IsQ0FBaEI7QUFDQSxXQUFLLEVBQUUsUUFBRixFQUFMLEVBQWMsVUFBQyxLQUFELEVBQVEsUUFBUixFQUFxQjtBQUNqQyxZQUFJLENBQUMsS0FBRCxJQUFVLFNBQVMsVUFBVCxLQUF3QixHQUF0QyxFQUEyQztBQUN6QyxjQUFNLE9BQU8sU0FBUyxJQUF0QjtBQUNBLGNBQU0sU0FBUyxJQUFJLE9BQU8sTUFBWCxFQUFmO0FBQ0EsaUJBQU8sV0FBUCxDQUFtQixJQUFuQixFQUF5QixVQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWlCO0FBQ3hDLGdCQUFNLE9BQU8sT0FBTyxVQUFwQjtBQUNBLGdCQUFNLFNBQVMsS0FBSyxTQUFMLENBQWUsQ0FBZixDQUFmO0FBQ0EsZ0JBQU0sVUFBVSxLQUFLLFNBQUwsQ0FBZSxDQUFmLENBQWhCO0FBQ0EsZ0JBQU0sV0FBVyxLQUFLLFVBQXRCO0FBQ0EsZ0JBQU0sWUFBWSxLQUFLLEtBQXZCO0FBQ0EsbUJBQU8sS0FBUCxDQUFhLEtBQWIsRUFBb0IsTUFBcEIsRUFBNEIsWUFBNUI7QUFDQSxnQkFBSSxNQUFNLE9BQU4sQ0FBYyxRQUFkLEtBQTJCLFNBQVMsTUFBVCxHQUFrQixDQUFqRCxFQUFvRDtBQUNsRCxtQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixLQUFLLFNBQVMsTUFBVCxHQUFrQixDQUF2QyxFQUEwQyxHQUExQyxFQUErQztBQUM3QyxvQkFBSSxPQUFPLFNBQVMsQ0FBVCxDQUFYO0FBQ0EsdUJBQU8sS0FBSyxPQUFMLENBQWEsbUJBQWIsRUFBa0MsRUFBbEMsQ0FBUDtBQUNBLHVCQUFPLEtBQUssT0FBTCxDQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FBUDtBQUNBLHdCQUFRLEdBQVIsQ0FBWSxRQUFRLElBQVIsQ0FBWjtBQUNBLHVCQUFPLGdCQUFjLENBQWQsQ0FBUCxJQUE2QixJQUE3QjtBQUNEO0FBQ0YsYUFSRCxNQVFPO0FBQ0wsa0JBQU0sYUFBYSxTQUFTLENBQVQsRUFBWSxPQUFaLENBQW9CLG1CQUFwQixFQUF5QyxFQUF6QyxDQUFuQjtBQUNBLHNCQUFRLEdBQVIsQ0FBWSxRQUFRLFVBQVIsQ0FBWjtBQUNBLHFCQUFPLFVBQVAsR0FBb0IsVUFBcEI7QUFDRDtBQUNELGdCQUFJLE1BQUosRUFBWTtBQUNWLGtCQUFNLFVBQVUsT0FBTyxPQUFQLENBQWUsS0FBZixFQUFzQixFQUF0QixDQUFoQjtBQUNBLHFCQUFPLEtBQVAsQ0FBYSxLQUFiLEVBQW9CLE1BQXBCLEVBQTRCLFNBQTVCLEVBQXVDLE9BQXZDO0FBQ0EscUJBQU8sTUFBUCxHQUFnQixPQUFoQjtBQUNEO0FBQ0QsZ0JBQUksT0FBSixFQUFhO0FBQ1gsa0JBQU0sTUFBTSxRQUFRLE9BQVIsQ0FBZ0IsS0FBaEIsRUFBdUIsRUFBdkIsQ0FBWjtBQUNBLHFCQUFPLEtBQVAsQ0FBYSxLQUFiLEVBQW9CLE1BQXBCLEVBQTRCLFNBQTVCLEVBQXVDLEdBQXZDO0FBQ0EscUJBQU8sR0FBUCxHQUFhLEdBQWI7QUFDRDtBQUNELGdCQUFJLE9BQU8sT0FBUCxDQUFlLEtBQW5CLEVBQTBCO0FBQ3hCLHFCQUFPLEtBQVAsQ0FBYSxLQUFiLEVBQW9CLE1BQXBCLEVBQTRCLFdBQTVCO0FBQ0EsbUJBQUssSUFBSSxLQUFJLENBQWIsRUFBZ0IsTUFBSyxVQUFVLE1BQVYsR0FBbUIsQ0FBeEMsRUFBMkMsSUFBM0MsRUFBZ0Q7QUFDOUMsb0JBQU0sUUFBTyxVQUFVLEVBQVYsQ0FBYjtBQUNBLG9CQUFNLE1BQU0sTUFBTSxRQUFOLENBQWUsTUFBSyxTQUFwQixFQUErQixPQUEvQixDQUF1QyxLQUF2QyxFQUE4QyxFQUE5QyxDQUFaO0FBQ0Esb0JBQU0sT0FBTyxNQUFNLFFBQU4sQ0FBZSxNQUFLLFNBQXBCLEVBQStCLE9BQS9CLENBQXVDLEtBQXZDLEVBQThDLEVBQTlDLENBQWI7QUFDQSxvQkFBTSxPQUFPLE1BQU0sUUFBTixDQUFlLE1BQUssYUFBcEIsRUFBbUMsT0FBbkMsQ0FBMkMsS0FBM0MsRUFBa0QsRUFBbEQsQ0FBYjtBQUNBLHVCQUFPLEtBQVAsQ0FBYSxLQUFiLEVBQW9CLE9BQXBCLEVBQTZCLEdBQTdCLEVBQWtDLElBQWxDO0FBQ0EsdUJBQU8sU0FBTyxFQUFQLENBQVAsSUFBc0IsR0FBdEI7QUFDQSx1QkFBTyxVQUFRLEVBQVIsQ0FBUCxJQUF1QixJQUF2QjtBQUNBLHVCQUFPLFVBQVEsRUFBUixDQUFQLElBQXVCLElBQXZCO0FBQ0Q7QUFDRjtBQUNELGdCQUFJLEtBQUssQ0FBVCxFQUFZLE1BQU0sT0FBTixDQUFjLEtBQUssQ0FBbkIsRUFBc0IsS0FBSyxDQUEzQixFQUE4QixNQUE5QjtBQUNaLGdCQUFJLEtBQUssQ0FBTCxJQUFVLE9BQU8sS0FBckIsRUFBNEIsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM1QixnQkFBSSxLQUFLLENBQUwsSUFBVSxDQUFDLE9BQU8sS0FBdEIsRUFBNkIsTUFBTSxJQUFJLEtBQUosQ0FBVSxtREFBVixDQUFOO0FBQzdCLGdCQUFJLEtBQUosRUFBVztBQUNULHNCQUFRLEdBQVIsQ0FBZSxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQW5DLFNBQTZDLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBakU7QUFDRCxhQUZELE1BRU87QUFDTCxrQkFBSSxPQUFPLEtBQVgsRUFBa0IsUUFBUSxHQUFSLENBQWUsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFuQyxTQUE2QyxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQWpFLGtEQUFrSCxLQUFLLEtBQXZILGtCQUF1SSxLQUFLLE9BQTVJO0FBQ25CO0FBQ0YsV0FuREQ7QUFvREQsU0F2REQsTUF1RE87QUFDTCxnQkFBTSxJQUFJLEtBQUosV0FBa0IsU0FBUyxVQUEzQixTQUF5QyxLQUF6QyxDQUFOO0FBQ0Q7QUFDRixPQTNERDtBQWpCVztBQTZFWixHQTdFRCxNQTZFTztBQUNMLFVBQU0sSUFBSSxLQUFKLHNDQUE0QyxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQWhFLE9BQU47QUFDRDtBQUNGLENBNUZEIiwiZmlsZSI6ImNtZHMvb25lbG9vay5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnZ29vZC1ndXktaHR0cCcpKClcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcbmNvbnN0IHhtbDJqcyA9IHJlcXVpcmUoJ3htbDJqcycpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnb25lbG9vayA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnT25lbG9vayBkZWZpbml0aW9ucydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsaW5rczoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0luY2x1ZGUgcmVzb3VyY2UgbGlua3MnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcClcbiAgY29uc3QgaG91cnMgPSBtb21lbnQobmV3IERhdGUpLmRpZmYoc3RhbXAsICdob3VycycpXG4gIGNvbnN0IG1pbnV0ZXMgPSBtb21lbnQobmV3IERhdGUpLmRpZmYoc3RhbXAsICdtaW51dGVzJylcbiAgY29uc3QgY2hlY2tTdGFtcCA9IHRvb2xzLmxpbWl0T25lbG9vayhjb25maWcpXG4gIGNvbmZpZyA9IGNoZWNrU3RhbXBbMF1cbiAgcHJvY2VlZCA9IGNoZWNrU3RhbXBbMV1cbiAgcmVzZXQgPSBjaGVja1N0YW1wWzJdXG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIG9uZWxvb2s6IHtcbiAgICAgICAgbGlua3M6IGFyZ3YubCxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICAgIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsKHRoZW1lLCAnZG93bicsICdPbmVsb29rJylcbiAgICBsZXQgdXJsID0gYGh0dHA6Ly9vbmVsb29rLmNvbS8/eG1sPTEmdz0ke2FyZ3Yud29yZH1gXG4gICAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgICB0eXBlOiAnb25lbG9vaycsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vd3d3Lm9uZWxvb2suY29tJyxcbiAgICAgIHVybCxcbiAgICB9XG4gICAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICAgIGh0dHAoeyB1cmwgfSwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc3QgYm9keSA9IHJlc3BvbnNlLmJvZHlcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IHhtbDJqcy5QYXJzZXIoKVxuICAgICAgICBwYXJzZXIucGFyc2VTdHJpbmcoYm9keSwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVzcCA9IHJlc3VsdC5PTFJlc3BvbnNlXG4gICAgICAgICAgY29uc3QgcGhyYXNlID0gcmVzcC5PTFBocmFzZXNbMF1cbiAgICAgICAgICBjb25zdCBzaW1pbGFyID0gcmVzcC5PTFNpbWlsYXJbMF1cbiAgICAgICAgICBjb25zdCBxdWlja2RlZiA9IHJlc3AuT0xRdWlja0RlZlxuICAgICAgICAgIGNvbnN0IHJlc291cmNlcyA9IHJlc3AuT0xSZXNcbiAgICAgICAgICB0aGVtZXMubGFiZWwodGhlbWUsICdkb3duJywgJ0RlZmluaXRpb24nKVxuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHF1aWNrZGVmKSAmJiBxdWlja2RlZi5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBxdWlja2RlZi5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBxdWlja2RlZltpXVxuICAgICAgICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC8mbHQ7fCZndDt8XFxufFxcL2kvZywgJycpXG4gICAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoL2lcIi9nLCAnXCInKVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGl0ZW0pKVxuICAgICAgICAgICAgICB0b2ZpbGVbW2BkZWZpbml0aW9uJHtpfWBdXSA9IGl0ZW1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IHF1aWNrZGVmWzBdLnJlcGxhY2UoLyZsdDt8Jmd0O3xcXG58XFwvaS9nLCAnJylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGN0c3R5bGUoZGVmaW5pdGlvbikpXG4gICAgICAgICAgICB0b2ZpbGUuZGVmaW5pdGlvbiA9IGRlZmluaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBocmFzZSkge1xuICAgICAgICAgICAgY29uc3QgcGhyYXNlcyA9IHBocmFzZS5yZXBsYWNlKC9cXG4vZywgJycpXG4gICAgICAgICAgICB0aGVtZXMubGFiZWwodGhlbWUsICdkb3duJywgJ1BocmFzZXMnLCBwaHJhc2VzKVxuICAgICAgICAgICAgdG9maWxlLnBocmFzZSA9IHBocmFzZXNcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNpbWlsYXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpbSA9IHNpbWlsYXIucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgICAgdGhlbWVzLmxhYmVsKHRoZW1lLCAnZG93bicsICdTaW1pbGFyJywgc2ltKVxuICAgICAgICAgICAgdG9maWxlLnNpbSA9IHNpbVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY29uZmlnLm9uZWxvb2subGlua3MpIHtcbiAgICAgICAgICAgIHRoZW1lcy5sYWJlbCh0aGVtZSwgJ2Rvd24nLCAnUmVzb3VyY2VzJylcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHJlc291cmNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IHJlc291cmNlc1tpXVxuICAgICAgICAgICAgICBjb25zdCByZXMgPSB0b29scy5hcnJUb1N0cihpdGVtLk9MUmVzTmFtZSkucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgICAgICBjb25zdCBsaW5rID0gdG9vbHMuYXJyVG9TdHIoaXRlbS5PTFJlc0xpbmspLnJlcGxhY2UoL1xcbi9nLCAnJylcbiAgICAgICAgICAgICAgY29uc3QgaG9tZSA9IHRvb2xzLmFyclRvU3RyKGl0ZW0uT0xSZXNIb21lTGluaykucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgICAgICB0aGVtZXMubGFiZWwodGhlbWUsICdyaWdodCcsIHJlcywgbGluaylcbiAgICAgICAgICAgICAgdG9maWxlW1tgcmVzJHtpfWBdXSA9IHJlc1xuICAgICAgICAgICAgICB0b2ZpbGVbW2BsaW5rJHtpfWBdXSA9IGxpbmtcbiAgICAgICAgICAgICAgdG9maWxlW1tgaG9tZSR7aX1gXV0gPSBob21lXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICAgICAgaWYgKGFyZ3YucyAmJiAhY29uZmlnLm1lcmdlKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBzYXZlIHVzZXIgY29uZmlnLCBzZXQgb3B0aW9uIG1lcmdlIHRvIHRydWUuXCIpXG4gICAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcub25lbG9vay5kYXRlLnJlbWFpbn0vJHtjb25maWcub25lbG9vay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdG9kYXkuYClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvbmZpZy51c2FnZSkgY29uc29sZS5sb2coYCR7Y29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW59LyR7Y29uZmlnLm9uZWxvb2suZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRvZGF5LCB3aWxsIHJlc2V0IGluICR7MjMgLSBob3Vyc30gaG91cnMsICR7NTkgLSBtaW51dGVzfSBtaW51dGVzLmApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX0gJHtlcnJvcn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRvZGF5J3MgdXNhZ2UgbGltaXQgb2YgJHtjb25maWcub25lbG9vay5kYXRlLmxpbWl0fS5gKVxuICB9XG59XG4iXX0=