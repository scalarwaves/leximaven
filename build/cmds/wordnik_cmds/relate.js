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
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var reset = false;
  if (minutes < 60) {
    config.wordnik.date.remain = config.wordnik.date.remain - 1;
    noon.save(CFILE, config);
  } else if (minutes >= 60) {
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
            console.log(config.wordnik.date.remain + '/' + config.wordnik.date.limit + ' requests remaining this hour, will reset in ' + (59 - minutes) + ' minutes.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL3JlbGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUsdUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLHFDQUZEO0FBR0wsYUFBUyxFQUhKO0FBSUwsVUFBTTtBQUpELEdBbkJTO0FBeUJoQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSxlQUZEO0FBR0wsYUFBUyxLQUhKO0FBSUwsVUFBTTtBQUpELEdBekJTO0FBK0JoQixRQUFNO0FBQ0osV0FBTyxHQURIO0FBRUosVUFBTSw2QkFGRjtBQUdKLGFBQVMsRUFITDtBQUlKLFVBQU07QUFKRjtBQS9CVSxDQUFsQjtBQXNDQSxRQUFRLE9B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S0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFqQjtBQUM1QixjQUFJLEtBQUssQ0FBTCxJQUFVLENBQUMsT0FBTyxLQUF0QixFQUE2QixRQUFRLEdBQVIsQ0FBWSxNQUFNLEdBQU4sQ0FBVSwyQkFBVixDQUFaO0FBQzdCLGNBQUksS0FBSixFQUFXO0FBQ1Qsb0JBQVEsR0FBUixDQUFlLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBbkMsU0FBNkMsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFqRTtBQUNELFdBRkQsTUFFTztBQUNMLG9CQUFRLEdBQVIsQ0FBZSxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLE1BQW5DLFNBQTZDLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBakUsc0RBQXNILEtBQUssT0FBM0g7QUFDRDtBQUNGLFNBaEJELE1BZ0JPO0FBQ0wsa0JBQVEsS0FBUixDQUFpQixNQUFNLEdBQU4sQ0FBVSxJQUFWLFdBQXVCLFNBQVMsVUFBaEMsT0FBakIsU0FBbUUsTUFBTSxHQUFOLENBQVUsS0FBVixDQUFuRTtBQUNEO0FBQ0YsT0FwQkQ7QUFuQ1c7QUF3RFosR0F4REQsTUF3RE87QUFDTCxZQUFRLEtBQVIsQ0FBYyxNQUFNLEdBQU4sMENBQWdELE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsS0FBcEUsT0FBZDtBQUNBLFlBQVEsSUFBUixDQUFhLENBQWI7QUFDRDtBQUNGLENBdEZEIiwiZmlsZSI6ImNtZHMvd29yZG5pa19jbWRzL3JlbGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ3JlbGF0ZSA8d29yZD4nXG5leHBvcnRzLmRlc2MgPSAnV29yZG5payByZWxhdGVkIHdvcmRzJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGxpbWl0OiB7XG4gICAgYWxpYXM6ICdsJyxcbiAgICBkZXNjOiAnTGltaXQgcmVzdWx0cyA9IHJlcXVpcmUodHlwZSBvcHRpb24nLFxuICAgIGRlZmF1bHQ6IDEwLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICB9LFxuICBjYW5vbjoge1xuICAgIGFsaWFzOiAnYycsXG4gICAgZGVzYzogJ1VzZSBjYW5vbmljYWwnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgdHlwZToge1xuICAgIGFsaWFzOiAndCcsXG4gICAgZGVzYzogJ1JlbGF0aW9uc2hpcCB0eXBlcyB0byBsaW1pdCcsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgbGV0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgbGV0IHByb2NlZWQgPSBmYWxzZVxuICBjb25zdCBzdGFtcCA9IG5ldyBEYXRlKGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXApXG4gIGNvbnN0IG1pbnV0ZXMgPSBtb21lbnQobmV3IERhdGUpLmRpZmYoc3RhbXAsICdtaW51dGVzJylcbiAgbGV0IHJlc2V0ID0gZmFsc2VcbiAgaWYgKG1pbnV0ZXMgPCA2MCkge1xuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSBpZiAobWludXRlcyA+PSA2MCkge1xuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXAgPSBtb21lbnQoKS5mb3JtYXQoKVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdFxuICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBSZXNldCBBUEkgbGltaXQgdG8gJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fS8ke2NvbmZpZy53b3JkbmlrLmRhdGUuaW50ZXJ2YWx9LmApKVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gLSAxXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH1cbiAgaWYgKGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID09PSAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gIH0gZWxzZSBpZiAoY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPCAwKSB7XG4gICAgcHJvY2VlZCA9IGZhbHNlXG4gICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSAwXG4gICAgbm9vbi5zYXZlKENGSUxFLCBjb25maWcpXG4gIH0gZWxzZSB7XG4gICAgcHJvY2VlZCA9IHRydWVcbiAgfVxuICBpZiAocHJvY2VlZCkge1xuICAgIGNvbnN0IHVzZXJDb25maWcgPSB7XG4gICAgICB3b3JkbmlrOiB7XG4gICAgICAgIHJlbGF0ZToge1xuICAgICAgICAgIGNhbm9uOiBhcmd2LmMsXG4gICAgICAgICAgdHlwZTogYXJndi50LFxuICAgICAgICAgIGxpbWl0OiBhcmd2LmwsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgICBpZiAoY29uZmlnLm1lcmdlKSBjb25maWcgPSBfLm1lcmdlKHt9LCBjb25maWcsIHVzZXJDb25maWcpXG4gICAgY29uc3QgdGhlbWUgPSB0aGVtZXMubG9hZFRoZW1lKGNvbmZpZy50aGVtZSlcbiAgICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ1dvcmRuaWsnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB3b3JkID0gYXJndi53b3JkXG4gICAgY29uc3QgdGFzayA9ICdyZWxhdGVkV29yZHMnXG4gICAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly9hcGkud29yZG5pay5jb206ODAvdjQvd29yZC5qc29uLydcbiAgICBjb25zdCBhcGlrZXkgPSBwcm9jZXNzLmVudi5XT1JETklLXG4gICAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7d29yZH0vJHt0YXNrfT9gXG4gICAgY29uc3QgcGNvbnQgPSBbXVxuICAgIHBjb250LnB1c2goYHVzZUNhbm9uaWNhbD0ke2NvbmZpZy53b3JkbmlrLnJlbGF0ZS5jYW5vbn0mYClcbiAgICBpZiAoY29uZmlnLndvcmRuaWsucmVsYXRlLnR5cGUgIT09ICcnKSB7XG4gICAgICBwY29udC5wdXNoKGByZWxhdGlvbnNoaXBUeXBlcz0ke2NvbmZpZy53b3JkbmlrLnJlbGF0ZS50eXBlfSZgKVxuICAgIH1cbiAgICBwY29udC5wdXNoKGBsaW1pdFBlclJlbGF0aW9uc2hpcFR5cGU9JHtjb25maWcud29yZG5pay5yZWxhdGUubGltaXR9JmApXG4gICAgcGNvbnQucHVzaChgYXBpX2tleT0ke2FwaWtleX1gKVxuICAgIGNvbnN0IHJlc3QgPSBwY29udC5qb2luKCcnKVxuICAgIGxldCB1cmwgPSBgJHt1cml9JHtyZXN0fWBcbiAgICB1cmwgPSBlbmNvZGVVUkkodXJsKVxuICAgIHRoZW1lcy5sYWJlbERvd24oJ1JlbGF0ZWQgd29yZHMnLCB0aGVtZSwgbnVsbClcbiAgICBjb25zdCB0b2ZpbGUgPSB7XG4gICAgICB0eXBlOiAncmVsYXRlZCB3b3JkcycsXG4gICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgIHVybCxcbiAgICB9XG4gICAgdG9maWxlLndvcmQgPSB3b3JkXG4gICAgbmVlZGxlLmdldCh1cmwsIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSByZXNwb25zZS5ib2R5XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodChpdGVtLnJlbGF0aW9uc2hpcFR5cGUsIHRoZW1lLCBgJHtpdGVtLndvcmRzLmpvaW4oJywgJyl9YClcbiAgICAgICAgICB0b2ZpbGVbW2B0eXBlJHtpfWBdXSA9IGl0ZW0ucmVsYXRpb25zaGlwVHlwZVxuICAgICAgICAgIHRvZmlsZVtbYHdvcmRzJHtpfWBdXSA9IGl0ZW0ud29yZHMuam9pbignLCAnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYFJlYWNoZWQgdGhpcyBob3VyJ3MgdXNhZ2UgbGltaXQgb2YgJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fS5gKSlcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxufVxuIl19