'use strict';

var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
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
    default: 50,
    type: 'number'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var userConfig = {
    rhyme: {
      lang: argv.l,
      max: argv.m
    }
  };
  if (config.prefer) config = _.merge({}, config, userConfig);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.labelDown('Rhymebrain', theme, null);
  var word = argv.word;
  var task = 'Rhymes';
  var prefix = 'http://rhymebrain.com/talk?function=get';
  var uri = '' + prefix + task + '&word=' + word + '&';
  var pcont = [];
  pcont.push('lang=' + config.rhyme.lang + '&');
  pcont.push('maxResults=' + config.rhyme.max + '&');
  var rest = pcont.join('');
  var url = '' + uri + rest;
  url = encodeURI(url);
  var tofile = { type: 'rhyme', source: 'http://rhymebrain.com' };
  var ctstyle = _.get(chalk, theme.content.style);
  needle.get(url, function (error, response) {
    if (!error && response.statusCode === 200) {
      var list = response.body;
      var rcont = [];
      for (var i = 0; i <= list.length - 1; i++) {
        var item = list[i];
        rcont.push(ctstyle('' + item.word));
        if (item.score >= 300) {
          tofile[['hiscore' + i]] = item.word;
        } else {
          tofile[['rhyme' + i]] = item.word;
        }
      }
      themes.labelRight('Rhymes', theme, rcont.join(','));
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
      if (argv.s && config.prefer) noon.save(CFILE, config);
    } else {
      console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGNBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUsbUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLHlCQUZGO0FBR0osYUFBUyxJQUhMO0FBSUosVUFBTTtBQUpGLEdBbkJVO0FBeUJoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSx1QkFGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSDtBQXpCVyxDQUFsQjtBQWdDQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQU0sYUFBYTtBQUNqQixXQUFPO0FBQ0wsWUFBTSxLQUFLLENBRE47QUFFTCxXQUFLLEtBQUs7QUFGTDtBQURVLEdBQW5CO0FBTUEsTUFBSSxPQUFPLE1BQVgsRUFBbUIsU0FBUyxFQUFFLEtBQUYsQ0FBUSxFQUFSLEVBQVksTUFBWixFQUFvQixVQUFwQixDQUFUO0FBQ25CLE1BQU0sUUFBUSxPQUFPLFNBQVAsQ0FBaUIsT0FBTyxLQUF4QixDQUFkO0FBQ0EsTUFBSSxPQUFPLE9BQVgsRUFBb0IsT0FBTyxTQUFQLENBQWlCLFlBQWpCLEVBQStCLEtBQS9CLEVBQXNDLElBQXRDO0FBQ3BCLE1BQU0sT0FBTyxLQUFLLElBQWxCO0FBQ0EsTUFBTSxPQUFPLFFBQWI7QUFDQSxNQUFNLFNBQVMseUNBQWY7QUFDQSxNQUFNLFdBQVMsTUFBVCxHQUFrQixJQUFsQixjQUErQixJQUEvQixNQUFOO0FBQ0EsTUFBTSxRQUFRLEVBQWQ7QUFDQSxRQUFNLElBQU4sV0FBbUIsT0FBTyxLQUFQLENBQWEsSUFBaEM7QUFDQSxRQUFNLElBQU4saUJBQXlCLE9BQU8sS0FBUCxDQUFhLEdBQXRDO0FBQ0EsTUFBTSxPQUFPLE1BQU0sSUFBTixDQUFXLEVBQVgsQ0FBYjtBQUNBLE1BQUksV0FBUyxHQUFULEdBQWUsSUFBbkI7QUFDQSxRQUFNLFVBQVUsR0FBVixDQUFOO0FBQ0EsTUFBTSxTQUFTLEVBQUUsTUFBTSxPQUFSLEVBQWlCLFFBQVEsdUJBQXpCLEVBQWY7QUFDQSxNQUFNLFVBQVUsRUFBRSxHQUFGLENBQU0sS0FBTixFQUFhLE1BQU0sT0FBTixDQUFjLEtBQTNCLENBQWhCO0FBQ0EsU0FBTyxHQUFQLENBQVcsR0FBWCxFQUFnQixVQUFDLEtBQUQsRUFBUSxRQUFSLEVBQXFCO0FBQ25DLFFBQUksQ0FBQyxLQUFELElBQVUsU0FBUyxVQUFULEtBQXdCLEdBQXRDLEVBQTJDO0FBQ3pDLFVBQU0sT0FBTyxTQUFTLElBQXRCO0FBQ0EsVUFBTSxRQUFRLEVBQWQ7QUFDQSxXQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLEtBQUssS0FBSyxNQUFMLEdBQWMsQ0FBbkMsRUFBc0MsR0FBdEMsRUFBMkM7QUFDekMsWUFBTSxPQUFPLEtBQUssQ0FBTCxDQUFiO0FBQ0EsY0FBTSxJQUFOLENBQVcsYUFBVyxLQUFLLElBQWhCLENBQVg7QUFDQSxZQUFJLEtBQUssS0FBTCxJQUFjLEdBQWxCLEVBQXVCO0FBQ3JCLGlCQUFPLGFBQVcsQ0FBWCxDQUFQLElBQTBCLEtBQUssSUFBL0I7QUFDRCxTQUZELE1BRU87QUFDTCxpQkFBTyxXQUFTLENBQVQsQ0FBUCxJQUF3QixLQUFLLElBQTdCO0FBQ0Q7QUFDRjtBQUNELGFBQU8sVUFBUCxDQUFrQixRQUFsQixFQUE0QixLQUE1QixFQUFtQyxNQUFNLElBQU4sQ0FBVyxHQUFYLENBQW5DO0FBQ0EsVUFBSSxLQUFLLENBQVQsRUFBWSxNQUFNLE9BQU4sQ0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDWixVQUFJLEtBQUssQ0FBTCxJQUFVLE9BQU8sTUFBckIsRUFBNkIsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM5QixLQWZELE1BZU87QUFDTCxjQUFRLEtBQVIsQ0FBaUIsTUFBTSxHQUFOLENBQVUsSUFBVixXQUF1QixTQUFTLFVBQWhDLE9BQWpCLFNBQW1FLE1BQU0sR0FBTixDQUFVLEtBQVYsQ0FBbkU7QUFDRDtBQUNGLEdBbkJEO0FBb0JELENBNUNEIiwiZmlsZSI6ImNtZHMvcmh5bWVicmFpbl9jbWRzL3JoeW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbmVlZGxlID0gcmVxdWlyZSgnbmVlZGxlJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdyaHltZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnUmh5bWVicmFpbiByaHltZXMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGFuZzoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0lTTyA2MzktMSBsYW5ndWFnZSBjb2RlJyxcbiAgICBkZWZhdWx0OiAnZW4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBtYXg6IHtcbiAgICBhbGlhczogJ20nLFxuICAgIGRlc2M6ICdNYXggcmVzdWx0cyB0byByZXR1cm4nLFxuICAgIGRlZmF1bHQ6IDUwLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgcmh5bWU6IHtcbiAgICAgIGxhbmc6IGFyZ3YubCxcbiAgICAgIG1heDogYXJndi5tLFxuICAgIH0sXG4gIH1cbiAgaWYgKGNvbmZpZy5wcmVmZXIpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdSaHltZWJyYWluJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHdvcmQgPSBhcmd2LndvcmRcbiAgY29uc3QgdGFzayA9ICdSaHltZXMnXG4gIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vcmh5bWVicmFpbi5jb20vdGFsaz9mdW5jdGlvbj1nZXQnXG4gIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3Rhc2t9JndvcmQ9JHt3b3JkfSZgXG4gIGNvbnN0IHBjb250ID0gW11cbiAgcGNvbnQucHVzaChgbGFuZz0ke2NvbmZpZy5yaHltZS5sYW5nfSZgKVxuICBwY29udC5wdXNoKGBtYXhSZXN1bHRzPSR7Y29uZmlnLnJoeW1lLm1heH0mYClcbiAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgY29uc3QgdG9maWxlID0geyB0eXBlOiAncmh5bWUnLCBzb3VyY2U6ICdodHRwOi8vcmh5bWVicmFpbi5jb20nIH1cbiAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICBuZWVkbGUuZ2V0KHVybCwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICBjb25zdCBsaXN0ID0gcmVzcG9uc2UuYm9keVxuICAgICAgY29uc3QgcmNvbnQgPSBbXVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGlzdC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgcmNvbnQucHVzaChjdHN0eWxlKGAke2l0ZW0ud29yZH1gKSlcbiAgICAgICAgaWYgKGl0ZW0uc2NvcmUgPj0gMzAwKSB7XG4gICAgICAgICAgdG9maWxlW1tgaGlzY29yZSR7aX1gXV0gPSBpdGVtLndvcmRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2ZpbGVbW2ByaHltZSR7aX1gXV0gPSBpdGVtLndvcmRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhlbWVzLmxhYmVsUmlnaHQoJ1JoeW1lcycsIHRoZW1lLCByY29udC5qb2luKCcsJykpXG4gICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5wcmVmZXIpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgIH1cbiAgfSlcbn1cbiJdfQ==