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
  var now = moment(new Date()).diff(stamp, 'hours');
  var diff = 24 - now;
  var reset = false;
  if (diff < 24) {
    config.onelook.date.remain = config.onelook.date.remain - 1;
    noon.save(CFILE, config);
  } else if (diff >= 24) {
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
          if (reset) {
            console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today.');
          } else {
            console.log(config.onelook.date.remain + '/' + config.onelook.date.limit + ' requests remaining today, will reset in ' + diff + ' hours.');
          }
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
//# sourceMappingURL=data:application/json;base64,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TSxHQUFOLENBQVUsS0FBVixDQUFuRTtBQUNEO0FBQ0YsT0F0REQ7QUFqQlc7QUF3RVosR0F4RUQsTUF3RU87QUFDTCxZQUFRLEtBQVIsQ0FBYyxNQUFNLEdBQU4sc0NBQTRDLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBaEUsT0FBZDtBQUNBLFlBQVEsSUFBUixDQUFhLENBQWI7QUFDRDtBQUNGLENBeEdEIiwiZmlsZSI6ImNtZHMvb25lbG9vay5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ29uZWxvb2sgPHdvcmQ+J1xuZXhwb3J0cy5kZXNjID0gJ09uZWxvb2sgZGVmaW5pdGlvbnMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIG91dDoge1xuICAgIGFsaWFzOiAnbycsXG4gICAgZGVzYzogJ1dyaXRlIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB5YW1sLCB4bWwnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICB9LFxuICBmb3JjZToge1xuICAgIGFsaWFzOiAnZicsXG4gICAgZGVzYzogJ0ZvcmNlIG92ZXJ3cml0aW5nIG91dGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgc2F2ZToge1xuICAgIGFsaWFzOiAncycsXG4gICAgZGVzYzogJ1NhdmUgZmxhZ3MgdG8gY29uZmlnIGZpbGUnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgbGlua3M6IHtcbiAgICBhbGlhczogJ2wnLFxuICAgIGRlc2M6ICdJbmNsdWRlIHJlc291cmNlIGxpbmtzJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy5vbmVsb29rLmRhdGUuc3RhbXApXG4gIGNvbnN0IG5vdyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ2hvdXJzJylcbiAgY29uc3QgZGlmZiA9IDI0IC0gbm93XG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGlmIChkaWZmIDwgMjQpIHtcbiAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKGRpZmYgPj0gMjQpIHtcbiAgICByZXNldCA9IHRydWVcbiAgICBjb25maWcub25lbG9vay5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLm9uZWxvb2suZGF0ZS5saW1pdH0vJHtjb25maWcub25lbG9vay5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgb25lbG9vazoge1xuICAgICAgICBsaW5rczogYXJndi5sLFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdPbmVsb29rJywgdGhlbWUsIG51bGwpXG4gICAgbGV0IHVybCA9IGBodHRwOi8vb25lbG9vay5jb20vP3htbD0xJnc9JHthcmd2LndvcmR9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgY29uc3QgdG9maWxlID0ge1xuICAgICAgdHlwZTogJ29uZWxvb2snLFxuICAgICAgc291cmNlOiAnaHR0cDovL3d3dy5vbmVsb29rLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgICBuZWVkbGUuZ2V0KHVybCwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc3Qgb2JqID0gcmVzcG9uc2UuYm9keVxuICAgICAgICBjb25zdCByZXNwID0gb2JqLk9MUmVzcG9uc2VcbiAgICAgICAgY29uc3QgcGhyYXNlID0gcmVzcC5PTFBocmFzZXNcbiAgICAgICAgY29uc3Qgc2ltaWxhciA9IHJlc3AuT0xTaW1pbGFyXG4gICAgICAgIGNvbnN0IHF1aWNrZGVmID0gcmVzcC5PTFF1aWNrRGVmXG4gICAgICAgIGNvbnN0IHJlc291cmNlcyA9IHJlc3AuT0xSZXNcbiAgICAgICAgdGhlbWVzLmxhYmVsRG93bignRGVmaW5pdGlvbicsIHRoZW1lLCBudWxsKVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShxdWlja2RlZikpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBxdWlja2RlZi5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tkZWZbaV1cbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoLyZsdDt8Jmd0O3xcXG58XFwvaS9nLCAnJylcbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoL2lcIi9nLCAnXCInKVxuICAgICAgICAgICAgY29uc29sZS5sb2coY3RzdHlsZShpdGVtKSlcbiAgICAgICAgICAgIHRvZmlsZVtbYGRlZmluaXRpb24ke2l9YF1dID0gaXRlbVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gcXVpY2tkZWYucmVwbGFjZSgvJmx0O3wmZ3Q7fFxcbnxcXC9pL2csICcnKVxuICAgICAgICAgIGNvbnNvbGUubG9nKGN0c3R5bGUoZGVmaW5pdGlvbikpXG4gICAgICAgICAgdG9maWxlLmRlZmluaXRpb24gPSBkZWZpbml0aW9uXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBocmFzZSkge1xuICAgICAgICAgIGNvbnN0IHBocmFzZXMgPSBwaHJhc2UucmVwbGFjZSgvXFxuL2csICcnKVxuICAgICAgICAgIHRoZW1lcy5sYWJlbERvd24oJ1BocmFzZXMnLCB0aGVtZSwgcGhyYXNlcylcbiAgICAgICAgICB0b2ZpbGUucGhyYXNlID0gcGhyYXNlc1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaW1pbGFyKSB7XG4gICAgICAgICAgY29uc3Qgc2ltID0gc2ltaWxhci5yZXBsYWNlKC9cXG4vZywgJycpXG4gICAgICAgICAgdGhlbWVzLmxhYmVsRG93bignU2ltaWxhcicsIHRoZW1lLCBzaW0pXG4gICAgICAgICAgdG9maWxlLnNpbSA9IHNpbVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcub25lbG9vay5saW5rcykge1xuICAgICAgICAgIHRoZW1lcy5sYWJlbERvd24oJ1Jlc291cmNlcycsIHRoZW1lLCBudWxsKVxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHJlc291cmNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSByZXNvdXJjZXNbaV1cbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGl0ZW0uT0xSZXNOYW1lLnJlcGxhY2UoL1xcbi9nLCAnJylcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBpdGVtLk9MUmVzTGluay5yZXBsYWNlKC9cXG4vZywgJycpXG4gICAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodChyZXMsIHRoZW1lLCBsaW5rKVxuICAgICAgICAgICAgdG9maWxlW1tgcmVzJHtpfWBdXSA9IHJlc1xuICAgICAgICAgICAgdG9maWxlW1tgbGluayR7aX1gXV0gPSBsaW5rXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcub25lbG9vay5kYXRlLnJlbWFpbn0vJHtjb25maWcub25lbG9vay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdG9kYXkuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcub25lbG9vay5kYXRlLnJlbWFpbn0vJHtjb25maWcub25lbG9vay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdG9kYXksIHdpbGwgcmVzZXQgaW4gJHtkaWZmfSBob3Vycy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYFJlYWNoZWQgdG9kYXkncyB1c2FnZSBsaW1pdCBvZiAke2NvbmZpZy5vbmVsb29rLmRhdGUubGltaXR9LmApKVxuICAgIHByb2Nlc3MuZXhpdCgxKVxuICB9XG59XG4iXX0=