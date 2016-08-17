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
  if (config.verbose) themes.label(theme, 'down', 'Wordsmith');
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
  var tofile = {
    type: 'anagram',
    source: 'http://wordsmith.org/',
    url: url
  };
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
      themes.label(theme, 'down', 'Anagrams');
      console.log(ctstyle('Anagrams for: ' + query + '\n' + found + ' found. Displaying ' + show + ':'));
      console.log(ctstyle(alist));
      tofile.found = found;
      tofile.show = show;
      tofile.alist = alist.split('\n');
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
    }
  });
};
//# sourceMappingURL=data:application/json;base64,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QUFJLHFCQUFxQixJQUFyQixDQUEwQixNQUFNLENBQWhDLENBQUosRUFBd0M7QUFDN0MsY0FBUSxHQUFSLENBQVksUUFBUSxvQkFBUixDQUFaO0FBQ0QsS0FGTSxNQUVBO0FBQ0wsVUFBTSxRQUFPLE1BQU0sQ0FBTixDQUFRLEtBQVIsQ0FBYywyREFBZCxDQUFiO0FBQ0EsVUFBTSxRQUFRLE1BQUssQ0FBTCxDQUFkO0FBQ0EsVUFBTSxPQUFPLE1BQUssQ0FBTCxDQUFiO0FBQ0EsVUFBTSxRQUFRLE1BQUssQ0FBTCxFQUFRLElBQVIsRUFBZDtBQUNBLGFBQU8sS0FBUCxDQUFhLEtBQWIsRUFBb0IsTUFBcEIsRUFBNEIsVUFBNUI7QUFDQSxjQUFRLEdBQVIsQ0FBWSwyQkFBeUIsS0FBekIsVUFBbUMsS0FBbkMsMkJBQThELElBQTlELE9BQVo7QUFDQSxjQUFRLEdBQVIsQ0FBWSxRQUFRLEtBQVIsQ0FBWjtBQUNBLGFBQU8sS0FBUCxHQUFlLEtBQWY7QUFDQSxhQUFPLElBQVAsR0FBYyxJQUFkO0FBQ0EsYUFBTyxLQUFQLEdBQWUsTUFBTSxLQUFOLENBQVksSUFBWixDQUFmO0FBQ0EsVUFBSSxLQUFLLENBQVQsRUFBWSxNQUFNLE9BQU4sQ0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDWixVQUFJLEtBQUssQ0FBTCxJQUFVLE9BQU8sS0FBckIsRUFBNEIsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM1QixVQUFJLEtBQUssQ0FBTCxJQUFVLENBQUMsT0FBTyxLQUF0QixFQUE2QixNQUFNLElBQUksS0FBSixDQUFVLG1EQUFWLENBQU47QUFDOUI7QUFDRixHQTNCRDtBQTRCRCxDQWxGRCIsImZpbGUiOiJjbWRzL2FuYWdyYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5jb25zdCBvcmEgPSByZXF1aXJlKCdvcmEnKVxuY29uc3QgeHJheSA9IHJlcXVpcmUoJ3gtcmF5JylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5jb25zdCBsYW5ncyA9IFsnZW5nbGlzaCcsXG4nZW5nbGlzaC1vYnNjdXJlJyxcbidnZXJtYW4nLFxuJ3NwYW5pc2gnLFxuJ2VzcGVyYW50bycsXG4nZnJlbmNoJyxcbidpdGFsaWFuJyxcbidsYXRpbicsXG4nZHV0Y2gnLFxuJ3BvcnR1Z3Vlc2UnLFxuJ3N3ZWRpc2gnLFxuJ25hbWVzJ11cblxuZXhwb3J0cy5jb21tYW5kID0gJ2FuYWdyYW0gPHF1ZXJ5PidcbmV4cG9ydHMuZGVzYyA9ICdXb3Jkc21pdGggYW5hZ3JhbXMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgY2FzZToge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJzAgLSBsb3dlcmNhc2UsIDEgLSBGaXJzdCBMZXR0ZXIsIDIgLSBVUFBFUkNBU0UnLFxuICAgIGRlZmF1bHQ6IDEsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIGV4Y2x1ZGU6IHtcbiAgICBhbGlhczogJ2UnLFxuICAgIGRlc2M6ICdBbmFncmFtcyBtdXN0IGV4Y2x1ZGUgdGhpcyB3b3JkJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgaW5jbHVkZToge1xuICAgIGFsaWFzOiAnaScsXG4gICAgZGVzYzogJ0FuYWdyYW1zIG11c3QgaW5jbHVkZSB0aGlzIHdvcmQnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBsYW5nOiB7XG4gICAgYWxpYXM6ICdhJyxcbiAgICBkZXNjOiBsYW5ncy5qb2luKCcsICcpLFxuICAgIGRlZmF1bHQ6ICdlbmdsaXNoJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgbGluZW51bToge1xuICAgIGFsaWFzOiAndScsXG4gICAgZGVzYzogJ1Nob3cgbGluZSBudW1iZXJzIHdpdGggYW5hZ3JhbXMnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGlzdDoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ1Nob3cgY2FuZGlkYXRlIHdvcmQgbGlzdCBvbmx5JyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICd0JyxcbiAgICBkZXNjOiAnTGltaXQgbnVtYmVyIG9mIHJlc3VsdHMnLFxuICAgIGRlZmF1bHQ6IDEwLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBtaW5sZXR0ZXI6IHtcbiAgICBhbGlhczogJ24nLFxuICAgIGRlc2M6ICdNaW5pbXVtIGxldHRlcnMgaW4gZWFjaCB3b3JkJyxcbiAgICBkZWZhdWx0OiAxLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBtYXhsZXR0ZXI6IHtcbiAgICBhbGlhczogJ3gnLFxuICAgIGRlc2M6ICdNYXhpbXVtIGxldHRlcnMgaW4gZWFjaCB3b3JkJyxcbiAgICBkZWZhdWx0OiA1MCxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgbWF4d29yZDoge1xuICAgIGFsaWFzOiAndycsXG4gICAgZGVzYzogJ01heGltdW0gd29yZHMgaW4gZWFjaCBhbmFncmFtJyxcbiAgICBkZWZhdWx0OiAxMCxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgcmVwZWF0OiB7XG4gICAgYWxpYXM6ICdyJyxcbiAgICBkZXNjOiAnUmVwZWF0IG9jY3VyZW5jZXMgb2YgYSB3b3JkIE9LJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgY29uc3QgdXNlckNvbmZpZyA9IHtcbiAgICBhbmFncmFtOiB7XG4gICAgICBjYXNlOiBhcmd2LmMsXG4gICAgICBsYW5nOiBhcmd2LmEsXG4gICAgICBsaW5lbnVtOiBhcmd2LnUsXG4gICAgICBsaXN0OiBhcmd2LmwsXG4gICAgICBsaW1pdDogYXJndi50LFxuICAgICAgbWlubGV0dGVyOiBhcmd2Lm4sXG4gICAgICBtYXhsZXR0ZXI6IGFyZ3YueCxcbiAgICAgIG1heHdvcmQ6IGFyZ3YudyxcbiAgICAgIHJlcGVhdDogYXJndi5yLFxuICAgIH0sXG4gIH1cbiAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbCh0aGVtZSwgJ2Rvd24nLCAnV29yZHNtaXRoJylcbiAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly93b3Jkc21pdGgub3JnL2FuYWdyYW0vYW5hZ3JhbS5jZ2k/YW5hZ3JhbT0nXG4gIGNvbnN0IHF1ZXJ5ID0gYXJndi5xdWVyeVxuICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHtxdWVyeX1gXG4gIGNvbnN0IHBjb250ID0gW11cbiAgY29uc3QgcmVwZWF0ID0gY29uZmlnLmFuYWdyYW0ucmVwZWF0ID8gJ3knIDogJ24nXG4gIGNvbnN0IGxpc3QgPSBjb25maWcuYW5hZ3JhbS5saXN0ID8gJ3knIDogJ24nXG4gIGNvbnN0IGxpbmVudW0gPSBjb25maWcuYW5hZ3JhbS5saW5lbnVtID8gJ3knIDogJ24nXG4gIHBjb250LnB1c2goYCZsYW5ndWFnZT0ke2NvbmZpZy5hbmFncmFtLmxhbmd9YClcbiAgcGNvbnQucHVzaChgJnQ9JHtjb25maWcuYW5hZ3JhbS5saW1pdH1gKVxuICBwY29udC5wdXNoKGAmZD0ke2NvbmZpZy5hbmFncmFtLm1heHdvcmR9YClcbiAgcGNvbnQucHVzaChgJmluY2x1ZGU9JHthcmd2Lml9YClcbiAgcGNvbnQucHVzaChgJmV4Y2x1ZGU9JHthcmd2LmV9YClcbiAgcGNvbnQucHVzaChgJm49JHtjb25maWcuYW5hZ3JhbS5taW5sZXR0ZXJ9YClcbiAgcGNvbnQucHVzaChgJm09JHtjb25maWcuYW5hZ3JhbS5tYXhsZXR0ZXJ9YClcbiAgcGNvbnQucHVzaChgJmE9JHtyZXBlYXR9YClcbiAgcGNvbnQucHVzaChgJmw9JHtsaXN0fWApXG4gIHBjb250LnB1c2goYCZxPSR7bGluZW51bX1gKVxuICBwY29udC5wdXNoKGAmaz0ke2NvbmZpZy5hbmFncmFtLmNhc2V9YClcbiAgcGNvbnQucHVzaCgnJnNyYz1hZHYnKVxuICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgdHlwZTogJ2FuYWdyYW0nLFxuICAgIHNvdXJjZTogJ2h0dHA6Ly93b3Jkc21pdGgub3JnLycsXG4gICAgdXJsLFxuICB9XG4gIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgY29uc3Qgc3Bpbm5lciA9IG9yYSh7XG4gICAgdGV4dDogYCR7Y2hhbGsuYm9sZC5jeWFuKCdMb2FkaW5nIGFuYWdyYW1zLi4uJyl9YCxcbiAgICBzcGlubmVyOiAnZG90czgnLFxuICAgIGNvbG9yOiAneWVsbG93JyxcbiAgfSlcbiAgc3Bpbm5lci5zdGFydCgpXG4gIGNvbnN0IHggPSB4cmF5KClcbiAgeCh1cmwsIHtcbiAgICBwOiAnLnA0MDJfcHJlbWl1bScsXG4gIH0pKChlcnIsIGJsb2NrKSA9PiB7XG4gICAgc3Bpbm5lci5zdG9wKClcbiAgICBzcGlubmVyLmNsZWFyKClcbiAgICBpZiAoL0lucHV0W2EtejAtOSBcXChcXClcXC4nXSovaS50ZXN0KGJsb2NrLnApKSB7XG4gICAgICBjb25zdCBkYXRhID0gYmxvY2sucC5tYXRjaCgvKElucHV0W2EtejAtOSBcXChcXClcXC4nXSopL2kpXG4gICAgICBsZXQgbXNnID0gZGF0YVsxXVxuICAgICAgbXNnID0gbXNnLnJlcGxhY2UoL2xldHRlcnNcXC5QbGVhc2UvaSwgJ2xldHRlcnMuXFxuUGxlYXNlJylcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnJlZChtc2cpKVxuICAgIH0gZWxzZSBpZiAoL05vIGFuYWdyYW1zIGZvdW5kL2kudGVzdChibG9jay5wKSkge1xuICAgICAgY29uc29sZS5sb2coY3RzdHlsZSgnTm8gYW5hZ3JhbXMgZm91bmQuJykpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBibG9jay5wLm1hdGNoKC8oXFxkKikgZm91bmRcXC4gRGlzcGxheWluZyAoW2EtejAtOSBdKik6KFthLXpcXHNdKilkb2N1bWVudC9pKVxuICAgICAgY29uc3QgZm91bmQgPSBkYXRhWzFdXG4gICAgICBjb25zdCBzaG93ID0gZGF0YVsyXVxuICAgICAgY29uc3QgYWxpc3QgPSBkYXRhWzNdLnRyaW0oKVxuICAgICAgdGhlbWVzLmxhYmVsKHRoZW1lLCAnZG93bicsICdBbmFncmFtcycpXG4gICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGBBbmFncmFtcyBmb3I6ICR7cXVlcnl9XFxuJHtmb3VuZH0gZm91bmQuIERpc3BsYXlpbmcgJHtzaG93fTpgKSlcbiAgICAgIGNvbnNvbGUubG9nKGN0c3R5bGUoYWxpc3QpKVxuICAgICAgdG9maWxlLmZvdW5kID0gZm91bmRcbiAgICAgIHRvZmlsZS5zaG93ID0gc2hvd1xuICAgICAgdG9maWxlLmFsaXN0ID0gYWxpc3Quc3BsaXQoJ1xcbicpXG4gICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHNhdmUgdXNlciBjb25maWcsIHNldCBvcHRpb24gbWVyZ2UgdG8gdHJ1ZS5cIilcbiAgICB9XG4gIH0pXG59XG4iXX0=