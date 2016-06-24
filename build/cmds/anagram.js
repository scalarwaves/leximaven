'use strict';

var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var chalk = require('chalk');
var noon = require('noon');
var ora = require('ora');
var xray = require('x-ray');

var CFILE = process.env.HOME + '/.leximaven.noon';
var langs = ['english', 'english-obscure', 'german', 'spanish', 'esperanto', 'french', 'italian', 'latin', 'dutch', 'portuguese', 'swedish', 'names'];

exports.command = 'anagram <query>';
exports.desc = 'Wordsmith anagrams';
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
  case: {
    alias: 'c',
    desc: '0 - lowercase, 1 - First Letter, 2 - UPPERCASE',
    default: 1,
    type: 'number'
  },
  exclude: {
    alias: 'e',
    desc: 'Anagrams must exclude this word',
    default: '',
    type: 'string'
  },
  include: {
    alias: 'i',
    desc: 'Anagrams must include this word',
    default: '',
    type: 'string'
  },
  lang: {
    alias: 'a',
    desc: langs.join(', '),
    default: 'english',
    type: 'string'
  },
  linenum: {
    alias: 'u',
    desc: 'Show line numbers with anagrams',
    default: false,
    type: 'boolean'
  },
  list: {
    alias: 'l',
    desc: 'Show candidate word list only',
    default: false,
    type: 'boolean'
  },
  limit: {
    alias: 't',
    desc: 'Limit number of results',
    default: 10,
    type: 'number'
  },
  minletter: {
    alias: 'n',
    desc: 'Minimum letters in each word',
    default: 1,
    type: 'number'
  },
  maxletter: {
    alias: 'x',
    desc: 'Maximum letters in each word',
    default: 50,
    type: 'number'
  },
  maxword: {
    alias: 'w',
    desc: 'Maximum words in each anagram',
    default: 10,
    type: 'number'
  },
  repeat: {
    alias: 'r',
    desc: 'Repeat occurences of a word OK',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var userConfig = {
    anagram: {
      case: argv.c,
      lang: argv.a,
      linenum: argv.u,
      list: argv.l,
      limit: argv.t,
      minletter: argv.n,
      maxletter: argv.x,
      maxword: argv.w,
      repeat: argv.r
    }
  };
  if (config.merge) config = _.merge({}, config, userConfig);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.labelDown('Wordsmith', theme, null);
  var prefix = 'http://wordsmith.org/anagram/anagram.cgi?anagram=';
  var query = argv.query;
  var uri = '' + prefix + query;
  var pcont = [];
  var repeat = config.anagram.repeat ? 'y' : 'n';
  var list = config.anagram.list ? 'y' : 'n';
  var linenum = config.anagram.linenum ? 'y' : 'n';
  pcont.push('&language=' + config.anagram.lang);
  pcont.push('&t=' + config.anagram.limit);
  pcont.push('&d=' + config.anagram.maxword);
  pcont.push('&include=' + argv.i);
  pcont.push('&exclude=' + argv.e);
  pcont.push('&n=' + config.anagram.minletter);
  pcont.push('&m=' + config.anagram.maxletter);
  pcont.push('&a=' + repeat);
  pcont.push('&l=' + list);
  pcont.push('&q=' + linenum);
  pcont.push('&k=' + config.anagram.case);
  pcont.push('&src=adv');
  var rest = pcont.join('');
  var url = '' + uri + rest;
  url = encodeURI(url);
  var tofile = { type: 'anagram', source: 'http://wordsmith.org/' };
  var ctstyle = _.get(chalk, theme.content.style);
  var spinner = ora({
    text: '' + chalk.bold.cyan('Loading anagrams...'),
    spinner: 'dots8',
    color: 'yellow'
  });
  spinner.start();
  var x = xray();
  x(url, {
    p: '.p402_premium'
  })(function (err, block) {
    spinner.stop();
    spinner.clear();
    if (/Input[a-z0-9 \(\)\.']*/i.test(block.p)) {
      var data = block.p.match(/(Input[a-z0-9 \(\)\.']*)/i);
      var msg = data[1];
      msg = msg.replace(/letters\.Please/i, 'letters.\nPlease');
      console.log(chalk.red(msg));
    } else if (/No anagrams found/i.test(block.p)) {
      console.log(ctstyle('No anagrams found.'));
    } else {
      var _data = block.p.match(/(\d*) found\. Displaying ([a-z0-9 ]*):([a-z\s]*)document/i);
      var found = _data[1];
      var show = _data[2];
      var alist = _data[3].trim();
      themes.labelDown('Anagrams', theme, null);
      console.log(ctstyle('Anagrams for: ' + query + '\n' + found + ' found. Displaying ' + show + ':'));
      console.log(ctstyle(alist));
      tofile.found = found;
      tofile.show = show;
      tofile.alist = alist.split('\n');
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,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QUFxQixJQUFyQixDQUEwQixNQUFNLENBQWhDLENBQUosRUFBd0M7QUFDN0MsY0FBUSxHQUFSLENBQVksUUFBUSxvQkFBUixDQUFaO0FBQ0QsS0FGTSxNQUVBO0FBQ0wsVUFBTSxRQUFPLE1BQU0sQ0FBTixDQUFRLEtBQVIsQ0FBYywyREFBZCxDQUFiO0FBQ0EsVUFBTSxRQUFRLE1BQUssQ0FBTCxDQUFkO0FBQ0EsVUFBTSxPQUFPLE1BQUssQ0FBTCxDQUFiO0FBQ0EsVUFBTSxRQUFRLE1BQUssQ0FBTCxFQUFRLElBQVIsRUFBZDtBQUNBLGFBQU8sU0FBUCxDQUFpQixVQUFqQixFQUE2QixLQUE3QixFQUFvQyxJQUFwQztBQUNBLGNBQVEsR0FBUixDQUFZLDJCQUF5QixLQUF6QixVQUFtQyxLQUFuQywyQkFBOEQsSUFBOUQsT0FBWjtBQUNBLGNBQVEsR0FBUixDQUFZLFFBQVEsS0FBUixDQUFaO0FBQ0EsYUFBTyxLQUFQLEdBQWUsS0FBZjtBQUNBLGFBQU8sSUFBUCxHQUFjLElBQWQ7QUFDQSxhQUFPLEtBQVAsR0FBZSxNQUFNLEtBQU4sQ0FBWSxJQUFaLENBQWY7QUFDQSxVQUFJLEtBQUssQ0FBVCxFQUFZLE1BQU0sT0FBTixDQUFjLEtBQUssQ0FBbkIsRUFBc0IsS0FBSyxDQUEzQixFQUE4QixNQUE5QjtBQUNaLFVBQUksS0FBSyxDQUFMLElBQVUsT0FBTyxLQUFyQixFQUE0QixLQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO0FBQzVCLFVBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLFFBQVEsR0FBUixDQUFZLE1BQU0sR0FBTixDQUFVLDJCQUFWLENBQVo7QUFDOUI7QUFDRixHQTNCRDtBQTRCRCxDQTlFRCIsImZpbGUiOiJjbWRzL2FuYWdyYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5jb25zdCBvcmEgPSByZXF1aXJlKCdvcmEnKVxuY29uc3QgeHJheSA9IHJlcXVpcmUoJ3gtcmF5JylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5jb25zdCBsYW5ncyA9IFsnZW5nbGlzaCcsXG4nZW5nbGlzaC1vYnNjdXJlJyxcbidnZXJtYW4nLFxuJ3NwYW5pc2gnLFxuJ2VzcGVyYW50bycsXG4nZnJlbmNoJyxcbidpdGFsaWFuJyxcbidsYXRpbicsXG4nZHV0Y2gnLFxuJ3BvcnR1Z3Vlc2UnLFxuJ3N3ZWRpc2gnLFxuJ25hbWVzJ11cblxuZXhwb3J0cy5jb21tYW5kID0gJ2FuYWdyYW0gPHF1ZXJ5PidcbmV4cG9ydHMuZGVzYyA9ICdXb3Jkc21pdGggYW5hZ3JhbXMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgY2FzZToge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJzAgLSBsb3dlcmNhc2UsIDEgLSBGaXJzdCBMZXR0ZXIsIDIgLSBVUFBFUkNBU0UnLFxuICAgIGRlZmF1bHQ6IDEsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIGV4Y2x1ZGU6IHtcbiAgICBhbGlhczogJ2UnLFxuICAgIGRlc2M6ICdBbmFncmFtcyBtdXN0IGV4Y2x1ZGUgdGhpcyB3b3JkJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgaW5jbHVkZToge1xuICAgIGFsaWFzOiAnaScsXG4gICAgZGVzYzogJ0FuYWdyYW1zIG11c3QgaW5jbHVkZSB0aGlzIHdvcmQnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBsYW5nOiB7XG4gICAgYWxpYXM6ICdhJyxcbiAgICBkZXNjOiBsYW5ncy5qb2luKCcsICcpLFxuICAgIGRlZmF1bHQ6ICdlbmdsaXNoJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgbGluZW51bToge1xuICAgIGFsaWFzOiAndScsXG4gICAgZGVzYzogJ1Nob3cgbGluZSBudW1iZXJzIHdpdGggYW5hZ3JhbXMnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGlzdDoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ1Nob3cgY2FuZGlkYXRlIHdvcmQgbGlzdCBvbmx5JyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICd0JyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDEwLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBtaW5sZXR0ZXI6IHtcbiAgICBhbGlhczogJ24nLFxuICAgIGRlc2M6ICdNaW5pbXVtIGxldHRlcnMgaW4gZWFjaCB3b3JkJyxcbiAgICBkZWZhdWx0OiAxLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBtYXhsZXR0ZXI6IHtcbiAgICBhbGlhczogJ3gnLFxuICAgIGRlc2M6ICdNYXhpbXVtIGxldHRlcnMgaW4gZWFjaCB3b3JkJyxcbiAgICBkZWZhdWx0OiA1MCxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgbWF4d29yZDoge1xuICAgIGFsaWFzOiAndycsXG4gICAgZGVzYzogJ01heGltdW0gd29yZHMgaW4gZWFjaCBhbmFncmFtJyxcbiAgICBkZWZhdWx0OiAxMCxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgcmVwZWF0OiB7XG4gICAgYWxpYXM6ICdyJyxcbiAgICBkZXNjOiAnUmVwZWF0IG9jY3VyZW5jZXMgb2YgYSB3b3JkIE9LJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICBhbmFncmFtOiB7XG4gICAgICBjYXNlOiBhcmd2LmMsXG4gICAgICBsYW5nOiBhcmd2LmEsXG4gICAgICBsaW5lbnVtOiBhcmd2LnUsXG4gICAgICBsaXN0OiBhcmd2LmwsXG4gICAgICBsaW1pdDogYXJndi50LFxuICAgICAgbWlubGV0dGVyOiBhcmd2Lm4sXG4gICAgICBtYXhsZXR0ZXI6IGFyZ3YueCxcbiAgICAgIG1heHdvcmQ6IGFyZ3YudyxcbiAgICAgIHJlcGVhdDogYXJndi5yLFxuICAgIH0sXG4gIH1cbiAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRzbWl0aCcsIHRoZW1lLCBudWxsKVxuICBjb25zdCBwcmVmaXggPSAnaHR0cDovL3dvcmRzbWl0aC5vcmcvYW5hZ3JhbS9hbmFncmFtLmNnaT9hbmFncmFtPSdcbiAgY29uc3QgcXVlcnkgPSBhcmd2LnF1ZXJ5XG4gIGNvbnN0IHVyaSA9IGAke3ByZWZpeH0ke3F1ZXJ5fWBcbiAgY29uc3QgcGNvbnQgPSBbXVxuICBjb25zdCByZXBlYXQgPSBjb25maWcuYW5hZ3JhbS5yZXBlYXQgPyAneScgOiAnbidcbiAgY29uc3QgbGlzdCA9IGNvbmZpZy5hbmFncmFtLmxpc3QgPyAneScgOiAnbidcbiAgY29uc3QgbGluZW51bSA9IGNvbmZpZy5hbmFncmFtLmxpbmVudW0gPyAneScgOiAnbidcbiAgcGNvbnQucHVzaChgJmxhbmd1YWdlPSR7Y29uZmlnLmFuYWdyYW0ubGFuZ31gKVxuICBwY29udC5wdXNoKGAmdD0ke2NvbmZpZy5hbmFncmFtLmxpbWl0fWApXG4gIHBjb250LnB1c2goYCZkPSR7Y29uZmlnLmFuYWdyYW0ubWF4d29yZH1gKVxuICBwY29udC5wdXNoKGAmaW5jbHVkZT0ke2FyZ3YuaX1gKVxuICBwY29udC5wdXNoKGAmZXhjbHVkZT0ke2FyZ3YuZX1gKVxuICBwY29udC5wdXNoKGAmbj0ke2NvbmZpZy5hbmFncmFtLm1pbmxldHRlcn1gKVxuICBwY29udC5wdXNoKGAmbT0ke2NvbmZpZy5hbmFncmFtLm1heGxldHRlcn1gKVxuICBwY29udC5wdXNoKGAmYT0ke3JlcGVhdH1gKVxuICBwY29udC5wdXNoKGAmbD0ke2xpc3R9YClcbiAgcGNvbnQucHVzaChgJnE9JHtsaW5lbnVtfWApXG4gIHBjb250LnB1c2goYCZrPSR7Y29uZmlnLmFuYWdyYW0uY2FzZX1gKVxuICBwY29udC5wdXNoKCcmc3JjPWFkdicpXG4gIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICBsZXQgdXJsID0gYCR7dXJpfSR7cmVzdH1gXG4gIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gIGNvbnN0IHRvZmlsZSA9IHsgdHlwZTogJ2FuYWdyYW0nLCBzb3VyY2U6ICdodHRwOi8vd29yZHNtaXRoLm9yZy8nIH1cbiAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICBjb25zdCBzcGlubmVyID0gb3JhKHtcbiAgICB0ZXh0OiBgJHtjaGFsay5ib2xkLmN5YW4oJ0xvYWRpbmcgYW5hZ3JhbXMuLi4nKX1gLFxuICAgIHNwaW5uZXI6ICdkb3RzOCcsXG4gICAgY29sb3I6ICd5ZWxsb3cnLFxuICB9KVxuICBzcGlubmVyLnN0YXJ0KClcbiAgY29uc3QgeCA9IHhyYXkoKVxuICB4KHVybCwge1xuICAgIHA6ICcucDQwMl9wcmVtaXVtJyxcbiAgfSkoKGVyciwgYmxvY2spID0+IHtcbiAgICBzcGlubmVyLnN0b3AoKVxuICAgIHNwaW5uZXIuY2xlYXIoKVxuICAgIGlmICgvSW5wdXRbYS16MC05IFxcKFxcKVxcLiddKi9pLnRlc3QoYmxvY2sucCkpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBibG9jay5wLm1hdGNoKC8oSW5wdXRbYS16MC05IFxcKFxcKVxcLiddKikvaSlcbiAgICAgIGxldCBtc2cgPSBkYXRhWzFdXG4gICAgICBtc2cgPSBtc2cucmVwbGFjZSgvbGV0dGVyc1xcLlBsZWFzZS9pLCAnbGV0dGVycy5cXG5QbGVhc2UnKVxuICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKG1zZykpXG4gICAgfSBlbHNlIGlmICgvTm8gYW5hZ3JhbXMgZm91bmQvaS50ZXN0KGJsb2NrLnApKSB7XG4gICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKCdObyBhbmFncmFtcyBmb3VuZC4nKSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGF0YSA9IGJsb2NrLnAubWF0Y2goLyhcXGQqKSBmb3VuZFxcLiBEaXNwbGF5aW5nIChbYS16MC05IF0qKTooW2Etelxcc10qKWRvY3VtZW50L2kpXG4gICAgICBjb25zdCBmb3VuZCA9IGRhdGFbMV1cbiAgICAgIGNvbnN0IHNob3cgPSBkYXRhWzJdXG4gICAgICBjb25zdCBhbGlzdCA9IGRhdGFbM10udHJpbSgpXG4gICAgICB0aGVtZXMubGFiZWxEb3duKCdBbmFncmFtcycsIHRoZW1lLCBudWxsKVxuICAgICAgY29uc29sZS5sb2coY3RzdHlsZShgQW5hZ3JhbXMgZm9yOiAke3F1ZXJ5fVxcbiR7Zm91bmR9IGZvdW5kLiBEaXNwbGF5aW5nICR7c2hvd306YCkpXG4gICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGFsaXN0KSlcbiAgICAgIHRvZmlsZS5mb3VuZCA9IGZvdW5kXG4gICAgICB0b2ZpbGUuc2hvdyA9IHNob3dcbiAgICAgIHRvZmlsZS5hbGlzdCA9IGFsaXN0LnNwbGl0KCdcXG4nKVxuICAgICAgaWYgKGFyZ3YubykgdG9vbHMub3V0RmlsZShhcmd2Lm8sIGFyZ3YuZiwgdG9maWxlKVxuICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgaWYgKGFyZ3YucyAmJiAhY29uZmlnLm1lcmdlKSBjb25zb2xlLmVycihjaGFsay5yZWQoJ1NldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZSEnKSlcbiAgICB9XG4gIH0pXG59XG4iXX0=