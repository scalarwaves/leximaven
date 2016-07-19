'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var chalk = require('chalk');
var moment = require('moment');
var needle = require('needle');
var noon = require('noon');

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
  var now = new Date();
  var diff = moment(now).diff(stamp, 'hours');
  var reset = 24 - diff;
  if (diff < 24) {
    config.onelook.date.remain = config.onelook.date.remain - 1;
    noon.save(CFILE, config);
  } else if (diff >= 24) {
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
      needle.get(url, function (error, response) {
        if (!error && response.statusCode === 200) {
          var obj = response.body;
          var resp = obj.OLResponse;
          var phrase = resp.OLPhrases;
          var similar = resp.OLSimilar;
          var quickdef = resp.OLQuickDef;
          var resources = resp.OLRes;
          themes.labelDown('Definition', theme, null);
          if (Array.isArray(quickdef)) {
            for (var i = 0; i <= quickdef.length - 1; i++) {
              var item = quickdef[i];
              item = item.replace(/&lt;|&gt;|\n|\/i/g, '');
              item = item.replace(/i"/g, '"');
              console.log(ctstyle(item));
              tofile[['definition' + i]] = item;
            }
          } else {
            var definition = quickdef.replace(/&lt;|&gt;|\n|\/i/g, '');
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
          console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today, will reset in ' + reset + ' hours.');
        } else {
          console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
        }
      });
    })();
  } else {
    console.error(chalk.red('Reached today\'s usage limit of ' + config.onelook.date.limit + '.'));
    process.exit(1);
  }
};
//# sourceMappingURL=data:application/json;base64,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QUFSLENBQWEsQ0FBYjtBQUNEO0FBQ0YsQ0FuR0QiLCJmaWxlIjoiY21kcy9vbmVsb29rLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcbmNvbnN0IG5lZWRsZSA9IHJlcXVpcmUoJ25lZWRsZScpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnb25lbG9vayA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnT25lbG9vayBkZWZpbml0aW9ucydcbmV4cG9ydHMuYnVpbGRlciA9IHtcbiAgb3V0OiB7XG4gICAgYWxpYXM6ICdvJyxcbiAgICBkZXNjOiAnV3JpdGUgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHlhbWwsIHhtbCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgb3V0ZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBzYXZlOiB7XG4gICAgYWxpYXM6ICdzJyxcbiAgICBkZXNjOiAnU2F2ZSBmbGFncyB0byBjb25maWcgZmlsZScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICBsaW5rczoge1xuICAgIGFsaWFzOiAnbCcsXG4gICAgZGVzYzogJ0luY2x1ZGUgcmVzb3VyY2UgbGlua3MnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbn1cbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7XG4gIHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKVxuICBsZXQgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBsZXQgcHJvY2VlZCA9IGZhbHNlXG4gIGNvbnN0IHN0YW1wID0gbmV3IERhdGUoY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcClcbiAgY29uc3Qgbm93ID0gbmV3IERhdGVcbiAgY29uc3QgZGlmZiA9IG1vbWVudChub3cpLmRpZmYoc3RhbXAsICdob3VycycpXG4gIGNvbnN0IHJlc2V0ID0gMjQgLSBkaWZmXG4gIGlmIChkaWZmIDwgMjQpIHtcbiAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKGRpZmYgPj0gMjQpIHtcbiAgICBjb25maWcub25lbG9vay5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLm9uZWxvb2suZGF0ZS5saW1pdH0vJHtjb25maWcub25lbG9vay5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgb25lbG9vazoge1xuICAgICAgICBsaW5rczogYXJndi5sLFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdPbmVsb29rJywgdGhlbWUsIG51bGwpXG4gICAgbGV0IHVybCA9IGBodHRwOi8vb25lbG9vay5jb20vP3htbD0xJnc9JHthcmd2LndvcmR9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ29uZWxvb2snLFxuICAgICAgc291cmNlOiAnaHR0cDovL3d3dy5vbmVsb29rLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgICBuZWVkbGUuZ2V0KHVybCwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc3Qgb2JqID0gcmVzcG9uc2UuYm9keVxuICAgICAgICBjb25zdCByZXNwID0gb2JqLk9MUmVzcG9uc2VcbiAgICAgICAgY29uc3QgcGhyYXNlID0gcmVzcC5PTFBocmFzZXNcbiAgICAgICAgY29uc3Qgc2ltaWxhciA9IHJlc3AuT0xTaW1pbGFyXG4gICAgICAgIGNvbnN0IHF1aWNrZGVmID0gcmVzcC5PTFF1aWNrRGVmXG4gICAgICAgIGNvbnN0IHJlc291cmNlcyA9IHJlc3AuT0xSZXNcbiAgICAgICAgdGhlbWVzLmxhYmVsRG93bignRGVmaW5pdGlvbicsIHRoZW1lLCBudWxsKVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShxdWlja2RlZikpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBxdWlja2RlZi5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tkZWZbaV1cbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoLyZsdDt8Jmd0O3xcXG58XFwvaS9nLCAnJylcbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoL2lcIi9nLCAnXCInKVxuICAgICAgICAgICAgY29uc29sZS5sb2coY3RzdHlsZShpdGVtKSlcbiAgICAgICAgICAgIHRvZmlsZVtbYGRlZmluaXRpb24ke2l9YF1dID0gaXRlbVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gcXVpY2tkZWYucmVwbGFjZSgvJmx0O3wmZ3Q7fFxcbnxcXC9pL2csICcnKVxuICAgICAgICAgIGNvbnNvbGUubG9nKGN0c3R5bGUoZGVmaW5pdGlvbikpXG4gICAgICAgICAgdG9maWxlLmRlZmluaXRpb24gPSBkZWZpbml0aW9uXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBocmFzZSkge1xuICAgICAgICAgIGNvbnN0IHBocmFzZXMgPSBwaHJhc2UucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgIHRoZW1lcy5sYWJlbERvd24oJ1BocmFzZXMnLCB0aGVtZSwgcGhyYXNlcylcbiAgICAgICAgICB0b2ZpbGUucGhyYXNlID0gcGhyYXNlc1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaW1pbGFyKSB7XG4gICAgICAgICAgY29uc3Qgc2ltID0gc2ltaWxhci5yZXBsYWNlKC9cXG4vZywgJycpXG4gICAgICAgICAgdGhlbWVzLmxhYmVsRG93bignU2ltaWxhcicsIHRoZW1lLCBzaW0pXG4gICAgICAgICAgdG9maWxlLnNpbSA9IHNpbVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcub25lbG9vay5saW5rcykge1xuICAgICAgICAgIHRoZW1lcy5sYWJlbERvd24oJ1Jlc291cmNlcycsIHRoZW1lLCBudWxsKVxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHJlc291cmNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSByZXNvdXJjZXNbaV1cbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGl0ZW0uT0xSZXNOYW1lLnJlcGxhY2UoL1xcbi9nLCAnJylcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBpdGVtLk9MUmVzTGluay5yZXBsYWNlKC9cXG4vZywgJycpXG4gICAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodChyZXMsIHRoZW1lLCBsaW5rKVxuICAgICAgICAgICAgdG9maWxlW1tgcmVzJHtpfWBdXSA9IHJlc1xuICAgICAgICAgICAgdG9maWxlW1tgbGluayR7aX1gXV0gPSBsaW5rXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcub25lbG9vay5kYXRlLnJlbWFpbn0vJHtjb25maWcub25lbG9vay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdG9kYXksIHdpbGwgcmVzZXQgaW4gJHtyZXNldH0gaG91cnMuYClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y2hhbGsucmVkLmJvbGQoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTpgKX0gJHtjaGFsay5yZWQoZXJyb3IpfWApXG4gICAgICB9XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChgUmVhY2hlZCB0b2RheSdzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLm9uZWxvb2suZGF0ZS5saW1pdH0uYCkpXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH1cbn1cbiJdfQ==