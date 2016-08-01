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
      themes.labelDown('Anagrams', theme, null);
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
//# sourceMappingURL=data:application/json;base64,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LElBQUkscUJBQXFCLElBQXJCLENBQTBCLE1BQU0sQ0FBaEMsQ0FBSixFQUF3QztBQUM3QyxjQUFRLEdBQVIsQ0FBWSxRQUFRLG9CQUFSLENBQVo7QUFDRCxLQUZNLE1BRUE7QUFDTCxVQUFNLFFBQU8sTUFBTSxDQUFOLENBQVEsS0FBUixDQUFjLDJEQUFkLENBQWI7QUFDQSxVQUFNLFFBQVEsTUFBSyxDQUFMLENBQWQ7QUFDQSxVQUFNLE9BQU8sTUFBSyxDQUFMLENBQWI7QUFDQSxVQUFNLFFBQVEsTUFBSyxDQUFMLEVBQVEsSUFBUixFQUFkO0FBQ0EsYUFBTyxTQUFQLENBQWlCLFVBQWpCLEVBQTZCLEtBQTdCLEVBQW9DLElBQXBDO0FBQ0EsY0FBUSxHQUFSLENBQVksMkJBQXlCLEtBQXpCLFVBQW1DLEtBQW5DLDJCQUE4RCxJQUE5RCxPQUFaO0FBQ0EsY0FBUSxHQUFSLENBQVksUUFBUSxLQUFSLENBQVo7QUFDQSxhQUFPLEtBQVAsR0FBZSxLQUFmO0FBQ0EsYUFBTyxJQUFQLEdBQWMsSUFBZDtBQUNBLGFBQU8sS0FBUCxHQUFlLE1BQU0sS0FBTixDQUFZLElBQVosQ0FBZjtBQUNBLFVBQUksS0FBSyxDQUFULEVBQVksTUFBTSxPQUFOLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCLEVBQThCLE1BQTlCO0FBQ1osVUFBSSxLQUFLLENBQUwsSUFBVSxPQUFPLEtBQXJCLEVBQTRCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDNUIsVUFBSSxLQUFLLENBQUwsSUFBVSxDQUFDLE9BQU8sS0FBdEIsRUFBNkIsTUFBTSxJQUFJLEtBQUosQ0FBVSxtREFBVixDQUFOO0FBQzlCO0FBQ0YsR0EzQkQ7QUE0QkQsQ0FsRkQiLCJmaWxlIjoiY21kcy9hbmFncmFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuY29uc3Qgb3JhID0gcmVxdWlyZSgnb3JhJylcbmNvbnN0IHhyYXkgPSByZXF1aXJlKCd4LXJheScpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuY29uc3QgbGFuZ3MgPSBbJ2VuZ2xpc2gnLFxuJ2VuZ2xpc2gtb2JzY3VyZScsXG4nZ2VybWFuJyxcbidzcGFuaXNoJyxcbidlc3BlcmFudG8nLFxuJ2ZyZW5jaCcsXG4naXRhbGlhbicsXG4nbGF0aW4nLFxuJ2R1dGNoJyxcbidwb3J0dWd1ZXNlJyxcbidzd2VkaXNoJyxcbiduYW1lcyddXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdhbmFncmFtIDxxdWVyeT4nXG5leHBvcnRzLmRlc2MgPSAnV29yZHNtaXRoIGFuYWdyYW1zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGNhc2U6IHtcbiAgICBhbGlhczogJ2MnLFxuICAgIGRlc2M6ICcwIC0gbG93ZXJjYXNlLCAxIC0gRmlyc3QgTGV0dGVyLCAyIC0gVVBQRVJDQVNFJyxcbiAgICBkZWZhdWx0OiAxLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBleGNsdWRlOiB7XG4gICAgYWxpYXM6ICdlJyxcbiAgICBkZXNjOiAnQW5hZ3JhbXMgbXVzdCBleGNsdWRlIHRoaXMgd29yZCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGluY2x1ZGU6IHtcbiAgICBhbGlhczogJ2knLFxuICAgIGRlc2M6ICdBbmFncmFtcyBtdXN0IGluY2x1ZGUgdGhpcyB3b3JkJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgbGFuZzoge1xuICAgIGFsaWFzOiAnYScsXG4gICAgZGVzYzogbGFuZ3Muam9pbignLCAnKSxcbiAgICBkZWZhdWx0OiAnZW5nbGlzaCcsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGxpbmVudW06IHtcbiAgICBhbGlhczogJ3UnLFxuICAgIGRlc2M6ICdTaG93IGxpbmUgbnVtYmVycyB3aXRoIGFuYWdyYW1zJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpc3Q6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdTaG93IGNhbmRpZGF0ZSB3b3JkIGxpc3Qgb25seScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsaW1pdDoge1xuICAgIGFsaWFzOiAndCcsXG4gICAgZGVzYzogJ0xpbWl0IG51bWJlciBvZiByZXN1bHRzJyxcbiAgICBkZWZhdWx0OiAxMCxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgbWlubGV0dGVyOiB7XG4gICAgYWxpYXM6ICduJyxcbiAgICBkZXNjOiAnTWluaW11bSBsZXR0ZXJzIGluIGVhY2ggd29yZCcsXG4gICAgZGVmYXVsdDogMSxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgbWF4bGV0dGVyOiB7XG4gICAgYWxpYXM6ICd4JyxcbiAgICBkZXNjOiAnTWF4aW11bSBsZXR0ZXJzIGluIGVhY2ggd29yZCcsXG4gICAgZGVmYXVsdDogNTAsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIG1heHdvcmQ6IHtcbiAgICBhbGlhczogJ3cnLFxuICAgIGRlc2M6ICdNYXhpbXVtIHdvcmRzIGluIGVhY2ggYW5hZ3JhbScsXG4gICAgZGVmYXVsdDogMTAsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIHJlcGVhdDoge1xuICAgIGFsaWFzOiAncicsXG4gICAgZGVzYzogJ1JlcGVhdCBvY2N1cmVuY2VzIG9mIGEgd29yZCBPSycsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgYW5hZ3JhbToge1xuICAgICAgY2FzZTogYXJndi5jLFxuICAgICAgbGFuZzogYXJndi5hLFxuICAgICAgbGluZW51bTogYXJndi51LFxuICAgICAgbGlzdDogYXJndi5sLFxuICAgICAgbGltaXQ6IGFyZ3YudCxcbiAgICAgIG1pbmxldHRlcjogYXJndi5uLFxuICAgICAgbWF4bGV0dGVyOiBhcmd2LngsXG4gICAgICBtYXh3b3JkOiBhcmd2LncsXG4gICAgICByZXBlYXQ6IGFyZ3YucixcbiAgICB9LFxuICB9XG4gIGlmIChjb25maWcubWVyZ2UpIGNvbmZpZyA9IF8ubWVyZ2Uoe30sIGNvbmZpZywgdXNlckNvbmZpZylcbiAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdXb3Jkc21pdGgnLCB0aGVtZSwgbnVsbClcbiAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly93b3Jkc21pdGgub3JnL2FuYWdyYW0vYW5hZ3JhbS5jZ2k/YW5hZ3JhbT0nXG4gIGNvbnN0IHF1ZXJ5ID0gYXJndi5xdWVyeVxuICBjb25zdCB1cmkgPSBgJHtwcmVmaXh9JHtxdWVyeX1gXG4gIGNvbnN0IHBjb250ID0gW11cbiAgY29uc3QgcmVwZWF0ID0gY29uZmlnLmFuYWdyYW0ucmVwZWF0ID8gJ3knIDogJ24nXG4gIGNvbnN0IGxpc3QgPSBjb25maWcuYW5hZ3JhbS5saXN0ID8gJ3knIDogJ24nXG4gIGNvbnN0IGxpbmVudW0gPSBjb25maWcuYW5hZ3JhbS5saW5lbnVtID8gJ3knIDogJ24nXG4gIHBjb250LnB1c2goYCZsYW5ndWFnZT0ke2NvbmZpZy5hbmFncmFtLmxhbmd9YClcbiAgcGNvbnQucHVzaChgJnQ9JHtjb25maWcuYW5hZ3JhbS5saW1pdH1gKVxuICBwY29udC5wdXNoKGAmZD0ke2NvbmZpZy5hbmFncmFtLm1heHdvcmR9YClcbiAgcGNvbnQucHVzaChgJmluY2x1ZGU9JHthcmd2Lml9YClcbiAgcGNvbnQucHVzaChgJmV4Y2x1ZGU9JHthcmd2LmV9YClcbiAgcGNvbnQucHVzaChgJm49JHtjb25maWcuYW5hZ3JhbS5taW5sZXR0ZXJ9YClcbiAgcGNvbnQucHVzaChgJm09JHtjb25maWcuYW5hZ3JhbS5tYXhsZXR0ZXJ9YClcbiAgcGNvbnQucHVzaChgJmE9JHtyZXBlYXR9YClcbiAgcGNvbnQucHVzaChgJmw9JHtsaXN0fWApXG4gIHBjb250LnB1c2goYCZxPSR7bGluZW51bX1gKVxuICBwY29udC5wdXNoKGAmaz0ke2NvbmZpZy5hbmFncmFtLmNhc2V9YClcbiAgcGNvbnQucHVzaCgnJnNyYz1hZHYnKVxuICBjb25zdCByZXN0ID0gcGNvbnQuam9pbignJylcbiAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgdHlwZTogJ2FuYWdyYW0nLFxuICAgIHNvdXJjZTogJ2h0dHA6Ly93b3Jkc21pdGgub3JnLycsXG4gICAgdXJsLFxuICB9XG4gIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgY29uc3Qgc3Bpbm5lciA9IG9yYSh7XG4gICAgdGV4dDogYCR7Y2hhbGsuYm9sZC5jeWFuKCdMb2FkaW5nIGFuYWdyYW1zLi4uJyl9YCxcbiAgICBzcGlubmVyOiAnZG90czgnLFxuICAgIGNvbG9yOiAneWVsbG93JyxcbiAgfSlcbiAgc3Bpbm5lci5zdGFydCgpXG4gIGNvbnN0IHggPSB4cmF5KClcbiAgeCh1cmwsIHtcbiAgICBwOiAnLnA0MDJfcHJlbWl1bScsXG4gIH0pKChlcnIsIGJsb2NrKSA9PiB7XG4gICAgc3Bpbm5lci5zdG9wKClcbiAgICBzcGlubmVyLmNsZWFyKClcbiAgICBpZiAoL0lucHV0W2EtejAtOSBcXChcXClcXC4nXSovaS50ZXN0KGJsb2NrLnApKSB7XG4gICAgICBjb25zdCBkYXRhID0gYmxvY2sucC5tYXRjaCgvKElucHV0W2EtejAtOSBcXChcXClcXC4nXSopL2kpXG4gICAgICBsZXQgbXNnID0gZGF0YVsxXVxuICAgICAgbXNnID0gbXNnLnJlcGxhY2UoL2xldHRlcnNcXC5QbGVhc2UvaSwgJ2xldHRlcnMuXFxuUGxlYXNlJylcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnJlZChtc2cpKVxuICAgIH0gZWxzZSBpZiAoL05vIGFuYWdyYW1zIGZvdW5kL2kudGVzdChibG9jay5wKSkge1xuICAgICAgY29uc29sZS5sb2coY3RzdHlsZSgnTm8gYW5hZ3JhbXMgZm91bmQuJykpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBibG9jay5wLm1hdGNoKC8oXFxkKikgZm91bmRcXC4gRGlzcGxheWluZyAoW2EtejAtOSBdKik6KFthLXpcXHNdKilkb2N1bWVudC9pKVxuICAgICAgY29uc3QgZm91bmQgPSBkYXRhWzFdXG4gICAgICBjb25zdCBzaG93ID0gZGF0YVsyXVxuICAgICAgY29uc3QgYWxpc3QgPSBkYXRhWzNdLnRyaW0oKVxuICAgICAgdGhlbWVzLmxhYmVsRG93bignQW5hZ3JhbXMnLCB0aGVtZSwgbnVsbClcbiAgICAgIGNvbnNvbGUubG9nKGN0c3R5bGUoYEFuYWdyYW1zIGZvcjogJHtxdWVyeX1cXG4ke2ZvdW5kfSBmb3VuZC4gRGlzcGxheWluZyAke3Nob3d9OmApKVxuICAgICAgY29uc29sZS5sb2coY3RzdHlsZShhbGlzdCkpXG4gICAgICB0b2ZpbGUuZm91bmQgPSBmb3VuZFxuICAgICAgdG9maWxlLnNob3cgPSBzaG93XG4gICAgICB0b2ZpbGUuYWxpc3QgPSBhbGlzdC5zcGxpdCgnXFxuJylcbiAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgIGlmIChhcmd2LnMgJiYgY29uZmlnLm1lcmdlKSBub29uLnNhdmUoQ0ZJTEUsIGNvbmZpZylcbiAgICAgIGlmIChhcmd2LnMgJiYgIWNvbmZpZy5tZXJnZSkgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc2F2ZSB1c2VyIGNvbmZpZywgc2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlLlwiKVxuICAgIH1cbiAgfSlcbn1cbiJdfQ==