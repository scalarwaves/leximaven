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
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvYW5hZ3JhbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQU0sU0FBUyxRQUFRLFdBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLFVBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7QUFDQSxJQUFNLE1BQU0sUUFBUSxLQUFSLENBQVo7QUFDQSxJQUFNLE9BQU8sUUFBUSxPQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOO0FBQ0EsSUFBTSxRQUFRLENBQUMsU0FBRCxFQUNkLGlCQURjLEVBRWQsUUFGYyxFQUdkLFNBSGMsRUFJZCxXQUpjLEVBS2QsUUFMYyxFQU1kLFNBTmMsRUFPZCxPQVBjLEVBUWQsT0FSYyxFQVNkLFlBVGMsRUFVZCxTQVZjLEVBV2QsT0FYYyxDQUFkOztBQWFBLFFBQVEsT0FBUixHQUFrQixpQkFBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxvQkFBZjtBQUNBLFFBQVEsT0FBUixHQUFrQjtBQUNoQixPQUFLO0FBQ0gsV0FBTyxHQURKO0FBRUgsVUFBTSwwQ0FGSDtBQUdILGFBQVMsRUFITjtBQUlILFVBQU07QUFKSCxHQURXO0FBT2hCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLDJCQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBUFM7QUFhaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sMkJBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FiVTtBQW1CaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sZ0RBRkY7QUFHSixhQUFTLENBSEw7QUFJSixVQUFNO0FBSkYsR0FuQlU7QUF5QmhCLFdBQVM7QUFDUCxXQUFPLEdBREE7QUFFUCxVQUFNLGlDQUZDO0FBR1AsYUFBUyxFQUhGO0FBSVAsVUFBTTtBQUpDLEdBekJPO0FBK0JoQixXQUFTO0FBQ1AsV0FBTyxHQURBO0FBRVAsVUFBTSxpQ0FGQztBQUdQLGFBQVMsRUFIRjtBQUlQLFVBQU07QUFKQyxHQS9CTztBQXFDaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sTUFBTSxJQUFOLENBQVcsSUFBWCxDQUZGO0FBR0osYUFBUyxTQUhMO0FBSUosVUFBTTtBQUpGLEdBckNVO0FBMkNoQixXQUFTO0FBQ1AsV0FBTyxHQURBO0FBRVAsVUFBTSxpQ0FGQztBQUdQLGFBQVMsS0FIRjtBQUlQLFVBQU07QUFKQyxHQTNDTztBQWlEaEIsUUFBTTtBQUNKLFdBQU8sR0FESDtBQUVKLFVBQU0sK0JBRkY7QUFHSixhQUFTLEtBSEw7QUFJSixVQUFNO0FBSkYsR0FqRFU7QUF1RGhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHlCQUZEO0FBR0wsYUFBUyxFQUhKO0FBSUwsVUFBTTtBQUpELEdBdkRTO0FBNkRoQixhQUFXO0FBQ1QsV0FBTyxHQURFO0FBRVQsVUFBTSw4QkFGRztBQUdULGFBQVMsQ0FIQTtBQUlULFVBQU07QUFKRyxHQTdESztBQW1FaEIsYUFBVztBQUNULFdBQU8sR0FERTtBQUVULFVBQU0sOEJBRkc7QUFHVCxhQUFTLEVBSEE7QUFJVCxVQUFNO0FBSkcsR0FuRUs7QUF5RWhCLFdBQVM7QUFDUCxXQUFPLEdBREE7QUFFUCxVQUFNLCtCQUZDO0FBR1AsYUFBUyxFQUhGO0FBSVAsVUFBTTtBQUpDLEdBekVPO0FBK0VoQixVQUFRO0FBQ04sV0FBTyxHQUREO0FBRU4sVUFBTSxnQ0FGQTtBQUdOLGFBQVMsS0FISDtBQUlOLFVBQU07QUFKQTtBQS9FUSxDQUFsQjtBQXNGQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxJQUFELEVBQVU7QUFDMUIsUUFBTSxXQUFOLENBQWtCLEtBQWxCO0FBQ0EsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBYjtBQUNBLE1BQU0sYUFBYTtBQUNqQixhQUFTO0FBQ1AsWUFBTSxLQUFLLENBREo7QUFFUCxZQUFNLEtBQUssQ0FGSjtBQUdQLGVBQVMsS0FBSyxDQUhQO0FBSVAsWUFBTSxLQUFLLENBSko7QUFLUCxhQUFPLEtBQUssQ0FMTDtBQU1QLGlCQUFXLEtBQUssQ0FOVDtBQU9QLGlCQUFXLEtBQUssQ0FQVDtBQVFQLGVBQVMsS0FBSyxDQVJQO0FBU1AsY0FBUSxLQUFLO0FBVE47QUFEUSxHQUFuQjtBQWFBLE1BQUksT0FBTyxLQUFYLEVBQWtCLFNBQVMsRUFBRSxLQUFGLENBQVEsRUFBUixFQUFZLE1BQVosRUFBb0IsVUFBcEIsQ0FBVDtBQUNsQixNQUFNLFFBQVEsT0FBTyxTQUFQLENBQWlCLE9BQU8sS0FBeEIsQ0FBZDtBQUNBLE1BQUksT0FBTyxPQUFYLEVBQW9CLE9BQU8sU0FBUCxDQUFpQixXQUFqQixFQUE4QixLQUE5QixFQUFxQyxJQUFyQztBQUNwQixNQUFNLFNBQVMsbURBQWY7QUFDQSxNQUFNLFFBQVEsS0FBSyxLQUFuQjtBQUNBLE1BQU0sV0FBUyxNQUFULEdBQWtCLEtBQXhCO0FBQ0EsTUFBTSxRQUFRLEVBQWQ7QUFDQSxNQUFNLFNBQVMsT0FBTyxPQUFQLENBQWUsTUFBZixHQUF3QixHQUF4QixHQUE4QixHQUE3QztBQUNBLE1BQU0sT0FBTyxPQUFPLE9BQVAsQ0FBZSxJQUFmLEdBQXNCLEdBQXRCLEdBQTRCLEdBQXpDO0FBQ0EsTUFBTSxVQUFVLE9BQU8sT0FBUCxDQUFlLE9BQWYsR0FBeUIsR0FBekIsR0FBK0IsR0FBL0M7QUFDQSxRQUFNLElBQU4sZ0JBQXdCLE9BQU8sT0FBUCxDQUFlLElBQXZDO0FBQ0EsUUFBTSxJQUFOLFNBQWlCLE9BQU8sT0FBUCxDQUFlLEtBQWhDO0FBQ0EsUUFBTSxJQUFOLFNBQWlCLE9BQU8sT0FBUCxDQUFlLE9BQWhDO0FBQ0EsUUFBTSxJQUFOLGVBQXVCLEtBQUssQ0FBNUI7QUFDQSxRQUFNLElBQU4sZUFBdUIsS0FBSyxDQUE1QjtBQUNBLFFBQU0sSUFBTixTQUFpQixPQUFPLE9BQVAsQ0FBZSxTQUFoQztBQUNBLFFBQU0sSUFBTixTQUFpQixPQUFPLE9BQVAsQ0FBZSxTQUFoQztBQUNBLFFBQU0sSUFBTixTQUFpQixNQUFqQjtBQUNBLFFBQU0sSUFBTixTQUFpQixJQUFqQjtBQUNBLFFBQU0sSUFBTixTQUFpQixPQUFqQjtBQUNBLFFBQU0sSUFBTixTQUFpQixPQUFPLE9BQVAsQ0FBZSxJQUFoQztBQUNBLFFBQU0sSUFBTixDQUFXLFVBQVg7QUFDQSxNQUFNLE9BQU8sTUFBTSxJQUFOLENBQVcsRUFBWCxDQUFiO0FBQ0EsTUFBSSxXQUFTLEdBQVQsR0FBZSxJQUFuQjtBQUNBLFFBQU0sVUFBVSxHQUFWLENBQU47QUFDQSxNQUFNLFNBQVM7QUFDYixVQUFNLFNBRE87QUFFYixZQUFRLHVCQUZLO0FBR2I7QUFIYSxHQUFmO0FBS0EsTUFBTSxVQUFVLEVBQUUsR0FBRixDQUFNLEtBQU4sRUFBYSxNQUFNLE9BQU4sQ0FBYyxLQUEzQixDQUFoQjtBQUNBLE1BQU0sVUFBVSxJQUFJO0FBQ2xCLGVBQVMsTUFBTSxJQUFOLENBQVcsSUFBWCxDQUFnQixxQkFBaEIsQ0FEUztBQUVsQixhQUFTLE9BRlM7QUFHbEIsV0FBTztBQUhXLEdBQUosQ0FBaEI7QUFLQSxVQUFRLEtBQVI7QUFDQSxNQUFNLElBQUksTUFBVjtBQUNBLElBQUUsR0FBRixFQUFPO0FBQ0wsT0FBRztBQURFLEdBQVAsRUFFRyxVQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWdCO0FBQ2pCLFlBQVEsSUFBUjtBQUNBLFlBQVEsS0FBUjtBQUNBLFFBQUksMEJBQTBCLElBQTFCLENBQStCLE1BQU0sQ0FBckMsQ0FBSixFQUE2QztBQUMzQyxVQUFNLE9BQU8sTUFBTSxDQUFOLENBQVEsS0FBUixDQUFjLDJCQUFkLENBQWI7QUFDQSxVQUFJLE1BQU0sS0FBSyxDQUFMLENBQVY7QUFDQSxZQUFNLElBQUksT0FBSixDQUFZLGtCQUFaLEVBQWdDLGtCQUFoQyxDQUFOO0FBQ0EsY0FBUSxHQUFSLENBQVksTUFBTSxHQUFOLENBQVUsR0FBVixDQUFaO0FBQ0QsS0FMRCxNQUtPLElBQUkscUJBQXFCLElBQXJCLENBQTBCLE1BQU0sQ0FBaEMsQ0FBSixFQUF3QztBQUM3QyxjQUFRLEdBQVIsQ0FBWSxRQUFRLG9CQUFSLENBQVo7QUFDRCxLQUZNLE1BRUE7QUFDTCxVQUFNLFFBQU8sTUFBTSxDQUFOLENBQVEsS0FBUixDQUFjLDJEQUFkLENBQWI7QUFDQSxVQUFNLFFBQVEsTUFBSyxDQUFMLENBQWQ7QUFDQSxVQUFNLE9BQU8sTUFBSyxDQUFMLENBQWI7QUFDQSxVQUFNLFFBQVEsTUFBSyxDQUFMLEVBQVEsSUFBUixFQUFkO0FBQ0EsYUFBTyxTQUFQLENBQWlCLFVBQWpCLEVBQTZCLEtBQTdCLEVBQW9DLElBQXBDO0FBQ0EsY0FBUSxHQUFSLENBQVksMkJBQXlCLEtBQXpCLFVBQW1DLEtBQW5DLDJCQUE4RCxJQUE5RCxPQUFaO0FBQ0EsY0FBUSxHQUFSLENBQVksUUFBUSxLQUFSLENBQVo7QUFDQSxhQUFPLEtBQVAsR0FBZSxLQUFmO0FBQ0EsYUFBTyxJQUFQLEdBQWMsSUFBZDtBQUNBLGFBQU8sS0FBUCxHQUFlLE1BQU0sS0FBTixDQUFZLElBQVosQ0FBZjtBQUNBLFVBQUksS0FBSyxDQUFULEVBQVksTUFBTSxPQUFOLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCLEVBQThCLE1BQTlCO0FBQ1osVUFBSSxLQUFLLENBQUwsSUFBVSxPQUFPLEtBQXJCLEVBQTRCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFDNUIsVUFBSSxLQUFLLENBQUwsSUFBVSxDQUFDLE9BQU8sS0FBdEIsRUFBNkIsUUFBUSxHQUFSLENBQVksTUFBTSxHQUFOLENBQVUsMkJBQVYsQ0FBWjtBQUM5QjtBQUNGLEdBM0JEO0FBNEJELENBbEZEIiwiZmlsZSI6ImNtZHMvYW5hZ3JhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcbmNvbnN0IG9yYSA9IHJlcXVpcmUoJ29yYScpXG5jb25zdCB4cmF5ID0gcmVxdWlyZSgneC1yYXknKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcbmNvbnN0IGxhbmdzID0gWydlbmdsaXNoJyxcbidlbmdsaXNoLW9ic2N1cmUnLFxuJ2dlcm1hbicsXG4nc3BhbmlzaCcsXG4nZXNwZXJhbnRvJyxcbidmcmVuY2gnLFxuJ2l0YWxpYW4nLFxuJ2xhdGluJyxcbidkdXRjaCcsXG4ncG9ydHVndWVzZScsXG4nc3dlZGlzaCcsXG4nbmFtZXMnXVxuXG5leHBvcnRzLmNvbW1hbmQgPSAnYW5hZ3JhbSA8cXVlcnk+J1xuZXhwb3J0cy5kZXNjID0gJ1dvcmRzbWl0aCBhbmFncmFtcydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBjYXNlOiB7XG4gICAgYWxpYXM6ICdjJyxcbiAgICBkZXNjOiAnMCAtIGxvd2VyY2FzZSwgMSAtIEZpcnN0IExldHRlciwgMiAtIFVQUEVSQ0FTRScsXG4gICAgZGVmYXVsdDogMSxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgfSxcbiAgZXhjbHVkZToge1xuICAgIGFsaWFzOiAnZScsXG4gICAgZGVzYzogJ0FuYWdyYW1zIG11c3QgZXhjbHVkZSB0aGlzIHdvcmQnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBpbmNsdWRlOiB7XG4gICAgYWxpYXM6ICdpJyxcbiAgICBkZXNjOiAnQW5hZ3JhbXMgbXVzdCBpbmNsdWRlIHRoaXMgd29yZCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGxhbmc6IHtcbiAgICBhbGlhczogJ2EnLFxuICAgIGRlc2M6IGxhbmdzLmpvaW4oJywgJyksXG4gICAgZGVmYXVsdDogJ2VuZ2xpc2gnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBsaW5lbnVtOiB7XG4gICAgYWxpYXM6ICd1JyxcbiAgICBkZXNjOiAnU2hvdyBsaW5lIG51bWJlcnMgd2l0aCBhbmFncmFtcycsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsaXN0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnU2hvdyBjYW5kaWRhdGUgd29yZCBsaXN0IG9ubHknLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGltaXQ6IHtcbiAgICBhbGlhczogJ3QnLFxuICAgIGRlc2M6ICdMaW1pdCBudW1iZXIgb2YgcmVzdWx0cycsXG4gICAgZGVmYXVsdDogMTAsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIG1pbmxldHRlcjoge1xuICAgIGFsaWFzOiAnbicsXG4gICAgZGVzYzogJ01pbmltdW0gbGV0dGVycyBpbiBlYWNoIHdvcmQnLFxuICAgIGRlZmF1bHQ6IDEsXG4gICAgdHlwZTogJ251bWJlcicsXG4gIH0sXG4gIG1heGxldHRlcjoge1xuICAgIGFsaWFzOiAneCcsXG4gICAgZGVzYzogJ01heGltdW0gbGV0dGVycyBpbiBlYWNoIHdvcmQnLFxuICAgIGRlZmF1bHQ6IDUwLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBtYXh3b3JkOiB7XG4gICAgYWxpYXM6ICd3JyxcbiAgICBkZXNjOiAnTWF4aW11bSB3b3JkcyBpbiBlYWNoIGFuYWdyYW0nLFxuICAgIGRlZmF1bHQ6IDEwLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICByZXBlYXQ6IHtcbiAgICBhbGlhczogJ3InLFxuICAgIGRlc2M6ICdSZXBlYXQgb2NjdXJlbmNlcyBvZiBhIHdvcmQgT0snLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgIGFuYWdyYW06IHtcbiAgICAgIGNhc2U6IGFyZ3YuYyxcbiAgICAgIGxhbmc6IGFyZ3YuYSxcbiAgICAgIGxpbmVudW06IGFyZ3YudSxcbiAgICAgIGxpc3Q6IGFyZ3YubCxcbiAgICAgIGxpbWl0OiBhcmd2LnQsXG4gICAgICBtaW5sZXR0ZXI6IGFyZ3YubixcbiAgICAgIG1heGxldHRlcjogYXJndi54LFxuICAgICAgbWF4d29yZDogYXJndi53LFxuICAgICAgcmVwZWF0OiBhcmd2LnIsXG4gICAgfSxcbiAgfVxuICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gIGlmIChjb25maWcudmVyYm9zZSkgdGhlbWVzLmxhYmVsRG93bignV29yZHNtaXRoJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IHByZWZpeCA9ICdodHRwOi8vd29yZHNtaXRoLm9yZy9hbmFncmFtL2FuYWdyYW0uY2dpP2FuYWdyYW09J1xuICBjb25zdCBxdWVyeSA9IGFyZ3YucXVlcnlcbiAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7cXVlcnl9YFxuICBjb25zdCBwY29udCA9IFtdXG4gIGNvbnN0IHJlcGVhdCA9IGNvbmZpZy5hbmFncmFtLnJlcGVhdCA/ICd5JyA6ICduJ1xuICBjb25zdCBsaXN0ID0gY29uZmlnLmFuYWdyYW0ubGlzdCA/ICd5JyA6ICduJ1xuICBjb25zdCBsaW5lbnVtID0gY29uZmlnLmFuYWdyYW0ubGluZW51bSA/ICd5JyA6ICduJ1xuICBwY29udC5wdXNoKGAmbGFuZ3VhZ2U9JHtjb25maWcuYW5hZ3JhbS5sYW5nfWApXG4gIHBjb250LnB1c2goYCZ0PSR7Y29uZmlnLmFuYWdyYW0ubGltaXR9YClcbiAgcGNvbnQucHVzaChgJmQ9JHtjb25maWcuYW5hZ3JhbS5tYXh3b3JkfWApXG4gIHBjb250LnB1c2goYCZpbmNsdWRlPSR7YXJndi5pfWApXG4gIHBjb250LnB1c2goYCZleGNsdWRlPSR7YXJndi5lfWApXG4gIHBjb250LnB1c2goYCZuPSR7Y29uZmlnLmFuYWdyYW0ubWlubGV0dGVyfWApXG4gIHBjb250LnB1c2goYCZtPSR7Y29uZmlnLmFuYWdyYW0ubWF4bGV0dGVyfWApXG4gIHBjb250LnB1c2goYCZhPSR7cmVwZWF0fWApXG4gIHBjb250LnB1c2goYCZsPSR7bGlzdH1gKVxuICBwY29udC5wdXNoKGAmcT0ke2xpbmVudW19YClcbiAgcGNvbnQucHVzaChgJms9JHtjb25maWcuYW5hZ3JhbS5jYXNlfWApXG4gIHBjb250LnB1c2goJyZzcmM9YWR2JylcbiAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgdXJsID0gZW5jb2RlVVJJKHVybClcbiAgY29uc3QgdG9maWxlID0ge1xuICAgIHR5cGU6ICdhbmFncmFtJyxcbiAgICBzb3VyY2U6ICdodHRwOi8vd29yZHNtaXRoLm9yZy8nLFxuICAgIHVybCxcbiAgfVxuICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gIGNvbnN0IHNwaW5uZXIgPSBvcmEoe1xuICAgIHRleHQ6IGAke2NoYWxrLmJvbGQuY3lhbignTG9hZGluZyBhbmFncmFtcy4uLicpfWAsXG4gICAgc3Bpbm5lcjogJ2RvdHM4JyxcbiAgICBjb2xvcjogJ3llbGxvdycsXG4gIH0pXG4gIHNwaW5uZXIuc3RhcnQoKVxuICBjb25zdCB4ID0geHJheSgpXG4gIHgodXJsLCB7XG4gICAgcDogJy5wNDAyX3ByZW1pdW0nLFxuICB9KSgoZXJyLCBibG9jaykgPT4ge1xuICAgIHNwaW5uZXIuc3RvcCgpXG4gICAgc3Bpbm5lci5jbGVhcigpXG4gICAgaWYgKC9JbnB1dFthLXowLTkgXFwoXFwpXFwuJ10qL2kudGVzdChibG9jay5wKSkge1xuICAgICAgY29uc3QgZGF0YSA9IGJsb2NrLnAubWF0Y2goLyhJbnB1dFthLXowLTkgXFwoXFwpXFwuJ10qKS9pKVxuICAgICAgbGV0IG1zZyA9IGRhdGFbMV1cbiAgICAgIG1zZyA9IG1zZy5yZXBsYWNlKC9sZXR0ZXJzXFwuUGxlYXNlL2ksICdsZXR0ZXJzLlxcblBsZWFzZScpXG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5yZWQobXNnKSlcbiAgICB9IGVsc2UgaWYgKC9ObyBhbmFncmFtcyBmb3VuZC9pLnRlc3QoYmxvY2sucCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKGN0c3R5bGUoJ05vIGFuYWdyYW1zIGZvdW5kLicpKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkYXRhID0gYmxvY2sucC5tYXRjaCgvKFxcZCopIGZvdW5kXFwuIERpc3BsYXlpbmcgKFthLXowLTkgXSopOihbYS16XFxzXSopZG9jdW1lbnQvaSlcbiAgICAgIGNvbnN0IGZvdW5kID0gZGF0YVsxXVxuICAgICAgY29uc3Qgc2hvdyA9IGRhdGFbMl1cbiAgICAgIGNvbnN0IGFsaXN0ID0gZGF0YVszXS50cmltKClcbiAgICAgIHRoZW1lcy5sYWJlbERvd24oJ0FuYWdyYW1zJywgdGhlbWUsIG51bGwpXG4gICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGBBbmFncmFtcyBmb3I6ICR7cXVlcnl9XFxuJHtmb3VuZH0gZm91bmQuIERpc3BsYXlpbmcgJHtzaG93fTpgKSlcbiAgICAgIGNvbnNvbGUubG9nKGN0c3R5bGUoYWxpc3QpKVxuICAgICAgdG9maWxlLmZvdW5kID0gZm91bmRcbiAgICAgIHRvZmlsZS5zaG93ID0gc2hvd1xuICAgICAgdG9maWxlLmFsaXN0ID0gYWxpc3Quc3BsaXQoJ1xcbicpXG4gICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICBpZiAoYXJndi5zICYmIGNvbmZpZy5tZXJnZSkgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgIH1cbiAgfSlcbn1cbiJdfQ==