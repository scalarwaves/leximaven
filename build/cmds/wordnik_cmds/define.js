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

exports.command = 'define <word>';
exports.desc = 'Wordnik definitions';
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
  defdict: {
    alias: 'd',
    desc: "CSV list of dictionaries or 'all'",
    default: 'all',
    type: 'string'
  },
  part: {
    alias: 'p',
    desc: 'CSV list of parts of speech. See http://developer.wordnik.com/docs.html for list of parts.',
    default: '',
    type: 'string'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var stamp = new Date(config.wordnik.date.stamp);
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var reset = false;
  if (minutes < 60) {
    config.wordnik.date.remain = config.wordnik.date.remain - 1;
    noon.save(CFILE, config);
  } else if (minutes >= 60) {
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
          define: {
            canon: argv.c,
            limit: argv.l,
            defdict: argv.d,
            part: argv.p
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'definitions';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.define.canon + '&');
      pcont.push('sourceDictionaries=' + config.wordnik.define.defdict + '&');
      pcont.push('includeRelated=false&');
      pcont.push('includeTags=false&');
      pcont.push('limit=' + config.wordnik.define.limit + '&');
      pcont.push('partOfSpeech=' + config.wordnik.define.part + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      var tofile = {
        type: 'definition',
        source: 'http://www.wordnik.com',
        url: url
      };
      var cstyle = _.get(chalk, theme.connector.style);
      var ctstyle = _.get(chalk, theme.content.style);
      var uline = _.get(chalk, theme.content.style + '.underline');
      var conn = cstyle(theme.connector.str);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = JSON.parse(response.body);
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            var icont = [];
            icont.push(ctstyle(item.text + ' '));
            icont.push(uline(item.partOfSpeech));
            icont.push(conn);
            icont.push(ctstyle(item.sourceDictionary));
            themes.labelRight('Definition', theme, icont.join(''));
            tofile[['text' + i]] = item.text;
            tofile[['deftype' + i]] = item.partOfSpeech;
            tofile[['source' + i]] = item.sourceDictionary;
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (argv.s && config.merge) noon.save(CFILE, config);
          if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
          if (reset) {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour.');
          } else {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
          }
        } else {
          console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
        }
      });
    })();
  } else {
    throw new Error('Reached this hour\'s usage limit of ' + config.wordnik.date.limit + '.');
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL2RlZmluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUscUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHlCQUZEO0FBR0wsYUFBUyxDQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixXQUFTO0FBQ1AsV0FBTyxHQURBO0FBRVAsVUFBTSxtQ0FGQztBQUdQLGFBQVMsS0FIRjtBQUlQLFVBQU07QUFKQyxHQS9CTztBQXFDaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sNEZBRkY7QUFHSixhQUFTLEVBSEw7QUFJSixVQUFNO0FBSkY7QUFyQ1UsQ0FBbEI7QUE0Q0EsUUFBUSxPQUFSLEdBQWtCLFVBQUMsSUFBRCxFQUFVO0FBQzFCLFFBQU0sV0FBTixDQUFrQixLQUFsQjtBQUNBLE1BQUksU0FBUyxLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWI7QUFDQSxNQUFJLFVBQVUsS0FBZDtBQUNBLE1BQU0sUUFBUSxJQUFJLElBQUosQ0FBUyxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQTdCLENBQWQ7QUFDQSxNQUFNLFVBQVUsT0FBTyxJQUFJLElBQUosRUFBUCxFQUFpQixJQUFqQixDQUFzQixLQUF0QixFQUE2QixTQUE3QixDQUFoQjtBQUNBLE1BQUksUUFBUSxLQUFaO0FBQ0EsTUFBSSxVQUFVLEVBQWQsRUFBa0I7QUFDaEIsV0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFwQixHQUE2QixPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQXBCLEdBQTZCLENBQTFEO0FBQ0EsU0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUNELEdBSEQsTUFHTyxJQUFJLFdBQVcsRUFBZixFQUFtQjtBQUN4QixZQUFRLElBQVI7QUFDQSxXQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQXBCLEdBQTRCLFNBQVMsTUFBVCxFQUE1QjtBQUNBLFdBQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBcEIsR0FBNkIsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFqRDtBQUNBLFlBQVEsR0FBUixDQUFZLE1BQU0sS0FBTix5QkFBa0MsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUF0RCxTQUErRCxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLFFBQW5GLE9BQVo7QUFDQSxXQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQXBCLEdBQTZCLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBcEIsR0FBNkIsQ0FBMUQ7QUFDQSxTQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO0FBQ0Q7QUFDRCxNQUFJLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBcEIsS0FBK0IsQ0FBbkMsRUFBc0M7QUFDcEMsY0FBVSxLQUFWO0FBQ0QsR0FGRCxNQUVPLElBQUksT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFwQixHQUE2QixDQUFqQyxFQUFvQztBQUN6QyxjQUFVLEtBQVY7QUFDQSxXQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQXBCLEdBQTZCLENBQTdCO0FBQ0EsU0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUNELEdBSk0sTUFJQTtBQUNMLGNBQVUsSUFBVjtBQUNEO0FBQ0QsTUFBSSxPQUFKLEVBQWE7QUFBQTtBQUNYLFVBQU0sYUFBYTtBQUNqQixpQkFBUztBQUNQLGtCQUFRO0FBQ04sbUJBQU8sS0FBSyxDQUROO0FBRU4sbUJBQU8sS0FBSyxDQUZOO0FBR04scUJBQVMsS0FBSyxDQUhSO0FBSU4sa0JBQU0sS0FBSztBQUpMO0FBREQ7QUFEUSxPQUFuQjtBQVVBLFVBQUksT0FBTyxLQUFYLEVBQWtCLFNBQVMsRUFBRSxLQUFGLENBQVEsRUFBUixFQUFZLE1BQVosRUFBb0IsVUFBcEIsQ0FBVDtBQUNsQixVQUFNLFFBQVEsT0FBTyxTQUFQLENBQWlCLE9BQU8sS0FBeEIsQ0FBZDtBQUNBLFVBQUksT0FBTyxPQUFYLEVBQW9CLE9BQU8sU0FBUCxDQUFpQixTQUFqQixFQUE0QixLQUE1QixFQUFtQyxJQUFuQztBQUNwQixVQUFNLE9BQU8sS0FBSyxJQUFsQjtBQUNBLFVBQU0sT0FBTyxhQUFiO0FBQ0EsVUFBTSxTQUFTLHlDQUFmO0FBQ0EsVUFBTSxTQUFTLFFBQVEsR0FBUixDQUFZLE9BQTNCO0FBQ0EsVUFBTSxXQUFTLE1BQVQsR0FBa0IsSUFBbEIsU0FBMEIsSUFBMUIsTUFBTjtBQUNBLFVBQU0sUUFBUSxFQUFkO0FBQ0EsWUFBTSxJQUFOLG1CQUEyQixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXNCLEtBQWpEO0FBQ0EsWUFBTSxJQUFOLHlCQUFpQyxPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXNCLE9BQXZEO0FBQ0EsWUFBTSxJQUFOLENBQVcsdUJBQVg7QUFDQSxZQUFNLElBQU4sQ0FBVyxvQkFBWDtBQUNBLFlBQU0sSUFBTixZQUFvQixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXNCLEtBQTFDO0FBQ0EsWUFBTSxJQUFOLG1CQUEyQixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXNCLElBQWpEO0FBQ0EsWUFBTSxJQUFOLGNBQXNCLE1BQXRCO0FBQ0EsVUFBTSxPQUFPLE1BQU0sSUFBTixDQUFXLEVBQVgsQ0FBYjtBQUNBLFVBQUksV0FBUyxHQUFULEdBQWUsSUFBbkI7QUFDQSxZQUFNLFVBQVUsR0FBVixDQUFOO0FBQ0EsVUFBTSxTQUFTO0FBQ2IsY0FBTSxZQURPO0FBRWIsZ0JBQVEsd0JBRks7QUFHYjtBQUhhLE9BQWY7QUFLQSxVQUFNLFNBQVMsRUFBRSxHQUFGLENBQU0sS0FBTixFQUFhLE1BQU0sU0FBTixDQUFnQixLQUE3QixDQUFmO0FBQ0EsVUFBTSxVQUFVLEVBQUUsR0FBRixDQUFNLEtBQU4sRUFBYSxNQUFNLE9BQU4sQ0FBYyxLQUEzQixDQUFoQjtBQUNBLFVBQU0sUUFBUSxFQUFFLEdBQUYsQ0FBTSxLQUFOLEVBQWdCLE1BQU0sT0FBTixDQUFjLEtBQTlCLGdCQUFkO0FBQ0EsVUFBTSxPQUFPLE9BQU8sTUFBTSxTQUFOLENBQWdCLEdBQXZCLENBQWI7QUFDQSxXQUFLLEVBQUUsUUFBRixFQUFMLEVBQWMsVUFBQyxLQUFELEVBQVEsUUFBUixFQUFxQjtBQUNqQyxZQUFJLENBQUMsS0FBRCxJQUFVLFNBQVMsVUFBVCxLQUF3QixHQUF0QyxFQUEyQztBQUN6QyxjQUFNLE9BQU8sS0FBSyxLQUFMLENBQVcsU0FBUyxJQUFwQixDQUFiO0FBQ0EsZUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixLQUFLLEtBQUssTUFBTCxHQUFjLENBQW5DLEVBQXNDLEdBQXRDLEVBQTJDO0FBQ3pDLGdCQUFNLE9BQU8sS0FBSyxDQUFMLENBQWI7QUFDQSxnQkFBTSxRQUFRLEVBQWQ7QUFDQSxrQkFBTSxJQUFOLENBQVcsUUFBVyxLQUFLLElBQWhCLE9BQVg7QUFDQSxrQkFBTSxJQUFOLENBQVcsTUFBTSxLQUFLLFlBQVgsQ0FBWDtBQUNBLGtCQUFNLElBQU4sQ0FBVyxJQUFYO0FBQ0Esa0JBQU0sSUFBTixDQUFXLFFBQVEsS0FBSyxnQkFBYixDQUFYO0FBQ0EsbUJBQU8sVUFBUCxDQUFrQixZQUFsQixFQUFnQyxLQUFoQyxFQUF1QyxNQUFNLElBQU4sQ0FBVyxFQUFYLENBQXZDO0FBQ0EsbUJBQU8sVUFBUSxDQUFSLENBQVAsSUFBdUIsS0FBSyxJQUE1QjtBQUNBLG1CQUFPLGFBQVcsQ0FBWCxDQUFQLElBQTBCLEtBQUssWUFBL0I7QUFDQSxtQkFBTyxZQUFVLENBQVYsQ0FBUCxJQUF5QixLQUFLLGdCQUE5QjtBQUNEO0FBQ0QsY0FBSSxLQUFLLENBQVQsRUFBWSxNQUFNLE9BQU4sQ0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDWixjQUFJLEtBQUssQ0FBTCxJQUFVLE9BQU8sS0FBckIsRUFBNEIsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM1QixjQUFJLEtBQUssQ0FBTCxJQUFVLENBQUMsT0FBTyxLQUF0QixFQUE2QixRQUFRLEdBQVIsQ0FBWSxNQUFNLEdBQU4sQ0FBVSwyQkFBVixDQUFaO0FBQzdCLGNBQUksS0FBSixFQUFXO0FBQ1Qsb0JBQVEsR0FBUixDQUFlLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBbkMsU0FBNkMsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFqRTtBQUNELFdBRkQsTUFFTztBQUNMLG9CQUFRLEdBQVIsQ0FBZSxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQW5DLFNBQTZDLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBakUsc0RBQXNILEtBQUssT0FBM0g7QUFDRDtBQUNGLFNBdEJELE1Bc0JPO0FBQ0wsa0JBQVEsS0FBUixDQUFpQixNQUFNLEdBQU4sQ0FBVSxJQUFWLFdBQXVCLFNBQVMsVUFBaEMsT0FBakIsU0FBbUUsTUFBTSxHQUFOLENBQVUsS0FBVixDQUFuRTtBQUNEO0FBQ0YsT0ExQkQ7QUF2Q1c7QUFrRVosR0FsRUQsTUFrRU87QUFDTCxVQUFNLElBQUksS0FBSiwwQ0FBZ0QsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFwRSxPQUFOO0FBQ0Q7QUFDRixDQWhHRCIsImZpbGUiOiJjbWRzL3dvcmRuaWtfY21kcy9kZWZpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjowICovXG5jb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi8uLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2dvb2QtZ3V5LWh0dHAnKSgpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnZGVmaW5lIDx3b3JkPidcbmV4cG9ydHMuZGVzYyA9ICdXb3JkbmlrIGRlZmluaXRpb25zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIGNhbm9uOiB7XG4gICAgYWxpYXM6ICdjJyxcbiAgICBkZXNjOiAnVXNlIGNhbm9uaWNhbCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBkZWZkaWN0OiB7XG4gICAgYWxpYXM6ICdkJyxcbiAgICBkZXNjOiBcIkNTViBsaXN0IG9mIGRpY3Rpb25hcmllcyBvciAnYWxsJ1wiLFxuICAgIGRlZmF1bHQ6ICdhbGwnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBwYXJ0OiB7XG4gICAgYWxpYXM6ICdwJyxcbiAgICBkZXNjOiAnQ1NWIGxpc3Qgb2YgcGFydHMgb2Ygc3BlZWNoLiBTZWUgaHR0cDovL2RldmVsb3Blci53b3JkbmlrLmNvbS9kb2NzLmh0bWwgZm9yIGxpc3Qgb2YgcGFydHMuJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcClcbiAgY29uc3QgbWludXRlcyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBsZXQgcmVzZXQgPSBmYWxzZVxuICBpZiAobWludXRlcyA8IDYwKSB7XG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIGlmIChtaW51dGVzID49IDYwKSB7XG4gICAgcmVzZXQgPSB0cnVlXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcCA9IG1vbWVudCgpLmZvcm1hdCgpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLmxpbWl0XG4gICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYFJlc2V0IEFQSSBsaW1pdCB0byAke2NvbmZpZy53b3JkbmlrLmRhdGUubGltaXR9LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5pbnRlcnZhbH0uYCkpXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiAtIDFcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfVxuICBpZiAoY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPT09IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgfSBlbHNlIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA8IDApIHtcbiAgICBwcm9jZWVkID0gZmFsc2VcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IDBcbiAgICBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgfSBlbHNlIHtcbiAgICBwcm9jZWVkID0gdHJ1ZVxuICB9XG4gIGlmIChwcm9jZWVkKSB7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICAgIHdvcmRuaWs6IHtcbiAgICAgICAgZGVmaW5lOiB7XG4gICAgICAgICAgY2Fub246IGFyZ3YuYyxcbiAgICAgICAgICBsaW1pdDogYXJndi5sLFxuICAgICAgICAgIGRlZmRpY3Q6IGFyZ3YuZCxcbiAgICAgICAgICBwYXJ0OiBhcmd2LnAsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdkZWZpbml0aW9ucydcbiAgICBjb25zdCBwcmVmaXggPSAnaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vJ1xuICAgIGNvbnN0IGFwaWtleSA9IHByb2Nlc3MuZW52LldPUkROSUtcbiAgICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHt3b3JkfS8ke3Rhc2t9P2BcbiAgICBjb25zdCBwY29udCA9IFtdXG4gICAgcGNvbnQucHVzaChgdXNlQ2Fub25pY2FsPSR7Y29uZmlnLndvcmRuaWsuZGVmaW5lLmNhbm9ufSZgKVxuICAgIHBjb250LnB1c2goYHNvdXJjZURpY3Rpb25hcmllcz0ke2NvbmZpZy53b3JkbmlrLmRlZmluZS5kZWZkaWN0fSZgKVxuICAgIHBjb250LnB1c2goJ2luY2x1ZGVSZWxhdGVkPWZhbHNlJicpXG4gICAgcGNvbnQucHVzaCgnaW5jbHVkZVRhZ3M9ZmFsc2UmJylcbiAgICBwY29udC5wdXNoKGBsaW1pdD0ke2NvbmZpZy53b3JkbmlrLmRlZmluZS5saW1pdH0mYClcbiAgICBwY29udC5wdXNoKGBwYXJ0T2ZTcGVlY2g9JHtjb25maWcud29yZG5pay5kZWZpbmUucGFydH0mYClcbiAgICBwY29udC5wdXNoKGBhcGlfa2V5PSR7YXBpa2V5fWApXG4gICAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gICAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ2RlZmluaXRpb24nLFxuICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGNzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb25uZWN0b3Iuc3R5bGUpXG4gICAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICAgIGNvbnN0IHVsaW5lID0gXy5nZXQoY2hhbGssIGAke3RoZW1lLmNvbnRlbnQuc3R5bGV9LnVuZGVybGluZWApXG4gICAgY29uc3QgY29ubiA9IGNzdHlsZSh0aGVtZS5jb25uZWN0b3Iuc3RyKVxuICAgIGh0dHAoeyB1cmwgfSwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuYm9keSlcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGlzdC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gbGlzdFtpXVxuICAgICAgICAgIGNvbnN0IGljb250ID0gW11cbiAgICAgICAgICBpY29udC5wdXNoKGN0c3R5bGUoYCR7aXRlbS50ZXh0fSBgKSlcbiAgICAgICAgICBpY29udC5wdXNoKHVsaW5lKGl0ZW0ucGFydE9mU3BlZWNoKSlcbiAgICAgICAgICBpY29udC5wdXNoKGNvbm4pXG4gICAgICAgICAgaWNvbnQucHVzaChjdHN0eWxlKGl0ZW0uc291cmNlRGljdGlvbmFyeSkpXG4gICAgICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ0RlZmluaXRpb24nLCB0aGVtZSwgaWNvbnQuam9pbignJykpXG4gICAgICAgICAgdG9maWxlW1tgdGV4dCR7aX1gXV0gPSBpdGVtLnRleHRcbiAgICAgICAgICB0b2ZpbGVbW2BkZWZ0eXBlJHtpfWBdXSA9IGl0ZW0ucGFydE9mU3BlZWNoXG4gICAgICAgICAgdG9maWxlW1tgc291cmNlJHtpfWBdXSA9IGl0ZW0uc291cmNlRGljdGlvbmFyeVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYClcbiAgfVxufVxuIl19