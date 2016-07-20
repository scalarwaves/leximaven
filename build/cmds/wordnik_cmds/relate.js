'use strict';

/* eslint max-len:0 */
var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
var moment = require('moment');
var needle = require('needle');
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'relate <word>';
exports.desc = 'Wordnik related words';
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
    desc: 'Limit results = require(type option',
    default: 10,
    type: 'number'
  },
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean'
  },
  type: {
    alias: 't',
    desc: 'Relationship types to limit',
    default: '',
    type: 'string'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var stamp = new Date(config.wordnik.date.stamp);
  var now = moment(new Date()).diff(stamp, 'minutes');
  var diff = 60 - now;
  var reset = false;
  if (diff < 60) {
    config.wordnik.date.remain = config.wordnik.date.remain - 1;
    noon.save(CFILE, config);
  } else if (diff >= 60) {
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
          relate: {
            canon: argv.c,
            type: argv.t,
            limit: argv.l
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'relatedWords';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.relate.canon + '&');
      if (config.wordnik.relate.type !== '') {
        pcont.push('relationshipTypes=' + config.wordnik.relate.type + '&');
      }
      pcont.push('limitPerRelationshipType=' + config.wordnik.relate.limit + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      themes.labelDown('Related words', theme, null);
      var tofile = {
        type: 'related words',
        source: 'http://www.wordnik.com',
        url: url
      };
      tofile.word = word;
      needle.get(url, function (error, response) {
        if (!error && response.statusCode === 200) {
          var list = response.body;
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            themes.labelRight(item.relationshipType, theme, '' + item.words.join(', '));
            tofile[['type' + i]] = item.relationshipType;
            tofile[['words' + i]] = item.words.join(', ');
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (argv.s && config.merge) noon.save(CFILE, config);
          if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'));
          if (reset) {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour.');
          } else {
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + diff + ' minutes.');
          }
        } else {
          console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
        }
      });
    })();
  } else {
    console.error(chalk.red('Reached this hour\'s usage limit of ' + config.wordnik.date.limit + '.'));
    process.exit(1);
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3JlbGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUsdUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHFDQUZEO0FBR0wsYUFBUyxFQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSw2QkFGRjtBQUdKLGFBQVMsRUFITDtBQUlKLFVBQU07QUFKRjtBQS9CVSxDQUFsQjtBQXNDQSxRQUFRLE9B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LElBQVUsT0FBTyxLQUFyQixFQUE0QixLQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO0FBQzVCLGNBQUksS0FBSyxDQUFMLElBQVUsQ0FBQyxPQUFPLEtBQXRCLEVBQTZCLFFBQVEsR0FBUixDQUFZLE1BQU0sR0FBTixDQUFVLDJCQUFWLENBQVo7QUFDN0IsY0FBSSxLQUFKLEVBQVc7QUFDVCxvQkFBUSxHQUFSLENBQWUsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixNQUFuQyxTQUE2QyxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQWpFO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsb0JBQVEsR0FBUixDQUFlLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBbkMsU0FBNkMsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFqRSxxREFBc0gsSUFBdEg7QUFDRDtBQUNGLFNBaEJELE1BZ0JPO0FBQ0wsa0JBQVEsS0FBUixDQUFpQixNQUFNLEdBQU4sQ0FBVSxJQUFWLFdBQXVCLFNBQVMsVUFBaEMsT0FBakIsU0FBbUUsTUFBTSxHQUFOLENBQVUsS0FBVixDQUFuRTtBQUNEO0FBQ0YsT0FwQkQ7QUFuQ1c7QUF3RFosR0F4REQsTUF3RE87QUFDTCxZQUFRLEtBQVIsQ0FBYyxNQUFNLEdBQU4sMENBQWdELE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBcEUsT0FBZDtBQUNBLFlBQVEsSUFBUixDQUFhLENBQWI7QUFDRDtBQUNGLENBdkZEIiwiZmlsZSI6ImNtZHMvd29yZG5pa19jbWRzL3JlbGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ3JlbGF0ZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnV29yZG5payByZWxhdGVkIHdvcmRzJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgcmVzdWx0cyA9IHJlcXVpcmUodHlwZSBvcHRpb24nLFxuICAgIGRlZmF1bHQ6IDEwLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBjYW5vbjoge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJ1VzZSBjYW5vbmljYWwnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgdHlwZToge1xuICAgIGFsaWFzOiAndCcsXG4gICAgZGVzYzogJ1JlbGF0aW9uc2hpcCB0eXBlcyB0byBsaW1pdCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXApXG4gIGNvbnN0IG5vdyA9IG1vbWVudChuZXcgRGF0ZSkuZGlmZihzdGFtcCwgJ21pbnV0ZXMnKVxuICBjb25zdCBkaWZmID0gNjAgLSBub3dcbiAgbGV0IHJlc2V0ID0gZmFsc2VcbiAgaWYgKGRpZmYgPCA2MCkge1xuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSBpZiAoZGlmZiA+PSA2MCkge1xuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXAgPSBtb21lbnQoKS5mb3JtYXQoKVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdFxuICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBSZXNldCBBUEkgbGltaXQgdG8gJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fS8ke2NvbmZpZy53b3JkbmlrLmRhdGUuaW50ZXJ2YWx9LmApKVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH1cbiAgaWYgKGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID09PSAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gIH0gZWxzZSBpZiAoY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPCAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSAwXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSB7XG4gICAgcHJvY2VlZCA9IHRydWVcbiAgfVxuICBpZiAocHJvY2VlZCkge1xuICAgIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgICB3b3JkbmlrOiB7XG4gICAgICAgIHJlbGF0ZToge1xuICAgICAgICAgIGNhbm9uOiBhcmd2LmMsXG4gICAgICAgICAgdHlwZTogYXJndi50LFxuICAgICAgICAgIGxpbWl0OiBhcmd2LmwsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdyZWxhdGVkV29yZHMnXG4gICAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly9hcGkud29yZG5pay5jb206ODAvdjQvd29yZC5qc29uLydcbiAgICBjb25zdCBhcGlrZXkgPSBwcm9jZXNzLmVudi5XT1JETklLXG4gICAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7d29yZH0vJHt0YXNrfT9gXG4gICAgY29uc3QgcGNvbnQgPSBbXVxuICAgIHBjb250LnB1c2goYHVzZUNhbm9uaWNhbD0ke2NvbmZpZy53b3JkbmlrLnJlbGF0ZS5jYW5vbn0mYClcbiAgICBpZiAoY29uZmlnLndvcmRuaWsucmVsYXRlLnR5cGUgIT09ICcnKSB7XG4gICAgICBwY29udC5wdXNoKGByZWxhdGlvbnNoaXBUeXBlcz0ke2NvbmZpZy53b3JkbmlrLnJlbGF0ZS50eXBlfSZgKVxuICAgIH1cbiAgICBwY29udC5wdXNoKGBsaW1pdFBlclJlbGF0aW9uc2hpcFR5cGU9JHtjb25maWcud29yZG5pay5yZWxhdGUubGltaXR9JmApXG4gICAgcGNvbnQucHVzaChgYXBpX2tleT0ke2FwaWtleX1gKVxuICAgIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICAgIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIHRoZW1lcy5sYWJlbERvd24oJ1JlbGF0ZWQgd29yZHMnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgICB0eXBlOiAncmVsYXRlZCB3b3JkcycsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgIHVybCxcbiAgICB9XG4gICAgdG9maWxlLndvcmQgPSB3b3JkXG4gICAgbmVlZGxlLmdldCh1cmwsIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSByZXNwb25zZS5ib2R5XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodChpdGVtLnJlbGF0aW9uc2hpcFR5cGUsIHRoZW1lLCBgJHtpdGVtLndvcmRzLmpvaW4oJywgJyl9YClcbiAgICAgICAgICB0b2ZpbGVbW2B0eXBlJHtpfWBdXSA9IGl0ZW0ucmVsYXRpb25zaGlwVHlwZVxuICAgICAgICAgIHRvZmlsZVtbYHdvcmRzJHtpfWBdXSA9IGl0ZW0ud29yZHMuam9pbignLCAnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAke2RpZmZ9IG1pbnV0ZXMuYClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgJHtjaGFsay5yZWQuYm9sZChgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OmApfSAke2NoYWxrLnJlZChlcnJvcil9YClcbiAgICAgIH1cbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYCkpXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH1cbn1cbiJdfQ==