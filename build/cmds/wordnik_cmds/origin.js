'use strict';

/* eslint max-len:0 */
var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var chalk = require('chalk');
var moment = require('moment');
var http = require('good-guy-http')();
var noon = require('noon');
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'origin <word>';
exports.desc = 'Wordnik etymologies';
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
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean'
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
          origin: {
            canon: argv.c
          }
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.labelDown('Wordnik', theme, null);
      var word = argv.word;
      var task = 'etymologies';
      var prefix = 'http://api.wordnik.com:80/v4/word.json/';
      var apikey = process.env.WORDNIK;
      var uri = '' + prefix + word + '/' + task + '?';
      var pcont = [];
      pcont.push('useCanonical=' + config.wordnik.origin.canon + '&');
      pcont.push('api_key=' + apikey);
      var rest = pcont.join('');
      var url = '' + uri + rest;
      url = encodeURI(url);
      var parser = new xml2js.Parser();
      var tofile = {
        type: 'etymology',
        source: 'http://www.wordnik.com',
        url: url
      };
      var ctstyle = _.get(chalk, theme.content.style);
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var resp = JSON.parse(response.body);
          var origin = resp[0];
          parser.parseString(origin, function (err, result) {
            var root = result.ety;
            var content = root._;
            var ets = root.ets;
            ets = ets.join(', ');
            themes.labelRight('Etymology', theme, ctstyle(content + ' ' + ets));
            tofile.etymology = content;
            tofile.origin = ets;
          });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvd29yZG5pa19jbWRzL29yaWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxTQUFTLFFBQVEsY0FBUixDQUFmO0FBQ0EsSUFBTSxRQUFRLFFBQVEsYUFBUixDQUFkOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU0sT0FBTyxRQUFRLGVBQVIsR0FBYjtBQUNBLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjtBQUNBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjs7QUFFQSxJQUFNLFFBQVcsUUFBUSxHQUFSLENBQVksSUFBdkIscUJBQU47O0FBRUEsUUFBUSxPQUFSLEdBQWtCLGVBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUscUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsT0FBSztBQUNILFdBQU8sR0FESjtBQUVILFVBQU0sMENBRkg7QUFHSCxhQUFTLEVBSE47QUFJSCxVQUFNO0FBSkgsR0FEVztBQU9oQixTQUFPO0FBQ0wsV0FBTyxHQURGO0FBRUwsVUFBTSwyQkFGRDtBQUdMLGFBQVMsS0FISjtBQUlMLFVBQU07QUFKRCxHQVBTO0FBYWhCLFFBQU07QUFDSixXQUFPLEdBREg7QUFFSixVQUFNLDJCQUZGO0FBR0osYUFBUyxLQUhMO0FBSUosVUFBTTtBQUpGLEdBYlU7QUFtQmhCLFNBQU87QUFDTCxXQUFPLEdBREY7QUFFTCxVQUFNLGVBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQ7QUFuQlMsQ0FBbEI7QUEwQkEsUUFBUSxPQUFSLEdBQWtCLFVBQUMsSUFBRCxFQUFVO0FBQzFCLFFBQU0sV0FBTixDQUFrQixLQUFsQjtBQUNBLE1BQUksU0FBUyxLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWI7QUFDQSxNQUFJLFVBQVUsS0FBZDtBQUNBLE1BQU0sUUFBUSxJ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b0JBQVEsR0FBUixDQUFlLE9BQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsTUFBbkMsU0FBNkMsT0FBTyxPQUFQLENBQWUsSUFBZixDQUFvQixLQUFqRSxzREFBc0gsS0FBSyxPQUEzSDtBQUNEO0FBQ0YsU0FwQkQsTUFvQk87QUFDTCxrQkFBUSxLQUFSLENBQWlCLE1BQU0sR0FBTixDQUFVLElBQVYsV0FBdUIsU0FBUyxVQUFoQyxPQUFqQixTQUFtRSxNQUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixPQXhCRDtBQTdCVztBQXNEWixHQXRERCxNQXNETztBQUNMLFVBQU0sSUFBSSxLQUFKLDBDQUFnRCxPQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEtBQXBFLE9BQU47QUFDRDtBQUNGLENBcEZEIiwiZmlsZSI6ImNtZHMvd29yZG5pa19jbWRzL29yaWdpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOjAgKi9cbmNvbnN0IHRoZW1lcyA9IHJlcXVpcmUoJy4uLy4uL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uLy4uL3Rvb2xzJylcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnZ29vZC1ndXktaHR0cCcpKClcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcbmNvbnN0IHhtbDJqcyA9IHJlcXVpcmUoJ3htbDJqcycpXG5cbmNvbnN0IENGSUxFID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLmxleGltYXZlbi5ub29uYFxuXG5leHBvcnRzLmNvbW1hbmQgPSAnb3JpZ2luIDx3b3JkPidcbmV4cG9ydHMuZGVzYyA9ICdXb3JkbmlrIGV0eW1vbG9naWVzJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHNhdmU6IHtcbiAgICBhbGlhczogJ3MnLFxuICAgIGRlc2M6ICdTYXZlIGZsYWdzIHRvIGNvbmZpZyBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIGNhbm9uOiB7XG4gICAgYWxpYXM6ICdjJyxcbiAgICBkZXNjOiAnVXNlIGNhbm9uaWNhbCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxufVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gIGxldCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGxldCBwcm9jZWVkID0gZmFsc2VcbiAgY29uc3Qgc3RhbXAgPSBuZXcgRGF0ZShjb25maWcud29yZG5pay5kYXRlLnN0YW1wKVxuICBjb25zdCBtaW51dGVzID0gbW9tZW50KG5ldyBEYXRlKS5kaWZmKHN0YW1wLCAnbWludXRlcycpXG4gIGxldCByZXNldCA9IGZhbHNlXG4gIGlmIChtaW51dGVzIDwgNjApIHtcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2UgaWYgKG1pbnV0ZXMgPj0gNjApIHtcbiAgICByZXNldCA9IHRydWVcbiAgICBjb25maWcud29yZG5pay5kYXRlLnN0YW1wID0gbW9tZW50KCkuZm9ybWF0KClcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUubGltaXRcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgUmVzZXQgQVBJIGxpbWl0IHRvICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0vJHtjb25maWcud29yZG5pay5kYXRlLmludGVydmFsfS5gKSlcbiAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIC0gMVxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9XG4gIGlmIChjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9PT0gMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICB9IGVsc2UgaWYgKGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluIDwgMCkge1xuICAgIHByb2NlZWQgPSBmYWxzZVxuICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gMFxuICAgIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICB9IGVsc2Uge1xuICAgIHByb2NlZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHByb2NlZWQpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0ge1xuICAgICAgd29yZG5pazoge1xuICAgICAgICBvcmlnaW46IHtcbiAgICAgICAgICBjYW5vbjogYXJndi5jLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tZXJnZSkgY29uZmlnID0gXy5tZXJnZSh7fSwgY29uZmlnLCB1c2VyQ29uZmlnKVxuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gICAgaWYgKGNvbmZpZy52ZXJib3NlKSB0aGVtZXMubGFiZWxEb3duKCdXb3JkbmlrJywgdGhlbWUsIG51bGwpXG4gICAgY29uc3Qgd29yZCA9IGFyZ3Yud29yZFxuICAgIGNvbnN0IHRhc2sgPSAnZXR5bW9sb2dpZXMnXG4gICAgY29uc3QgcHJlZml4ID0gJ2h0dHA6Ly9hcGkud29yZG5pay5jb206ODAvdjQvd29yZC5qc29uLydcbiAgICBjb25zdCBhcGlrZXkgPSBwcm9jZXNzLmVudi5XT1JETklLXG4gICAgY29uc3QgdXJpID0gYCR7cHJlZml4fSR7d29yZH0vJHt0YXNrfT9gXG4gICAgY29uc3QgcGNvbnQgPSBbXVxuICAgIHBjb250LnB1c2goYHVzZUNhbm9uaWNhbD0ke2NvbmZpZy53b3JkbmlrLm9yaWdpbi5jYW5vbn0mYClcbiAgICBwY29udC5wdXNoKGBhcGlfa2V5PSR7YXBpa2V5fWApXG4gICAgY29uc3QgcmVzdCA9IHBjb250LmpvaW4oJycpXG4gICAgbGV0IHVybCA9IGAke3VyaX0ke3Jlc3R9YFxuICAgIHVybCA9IGVuY29kZVVSSSh1cmwpXG4gICAgY29uc3QgcGFyc2VyID0gbmV3IHhtbDJqcy5QYXJzZXIoKVxuICAgIGNvbnN0IHRvZmlsZSA9IHtcbiAgICAgIHR5cGU6ICdldHltb2xvZ3knLFxuICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICB1cmwsXG4gICAgfVxuICAgIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgICBodHRwKHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IHJlc3AgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpXG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHJlc3BbMF1cbiAgICAgICAgcGFyc2VyLnBhcnNlU3RyaW5nKG9yaWdpbiwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgICAgY29uc3Qgcm9vdCA9IHJlc3VsdC5ldHlcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gcm9vdC5fXG4gICAgICAgICAgbGV0IGV0cyA9IHJvb3QuZXRzXG4gICAgICAgICAgZXRzID0gZXRzLmpvaW4oJywgJylcbiAgICAgICAgICB0aGVtZXMubGFiZWxSaWdodCgnRXR5bW9sb2d5JywgdGhlbWUsIGN0c3R5bGUoYCR7Y29udGVudH0gJHtldHN9YCkpXG4gICAgICAgICAgdG9maWxlLmV0eW1vbG9neSA9IGNvbnRlbnRcbiAgICAgICAgICB0b2ZpbGUub3JpZ2luID0gZXRzXG4gICAgICAgIH0pXG4gICAgICAgIGlmIChhcmd2Lm8pIHRvb2xzLm91dEZpbGUoYXJndi5vLCBhcmd2LmYsIHRvZmlsZSlcbiAgICAgICAgaWYgKGFyZ3YucyAmJiBjb25maWcubWVyZ2UpIG5vb24uc2F2ZShDRklMRSwgY29uZmlnKVxuICAgICAgICBpZiAoYXJndi5zICYmICFjb25maWcubWVyZ2UpIGNvbnNvbGUuZXJyKGNoYWxrLnJlZCgnU2V0IG9wdGlvbiBtZXJnZSB0byB0cnVlIScpKVxuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjb25maWcud29yZG5pay5kYXRlLnJlbWFpbn0vJHtjb25maWcud29yZG5pay5kYXRlLmxpbWl0fSByZXF1ZXN0cyByZW1haW5pbmcgdGhpcyBob3VyLmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7Y29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW59LyR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0gcmVxdWVzdHMgcmVtYWluaW5nIHRoaXMgaG91ciwgd2lsbCByZXNldCBpbiAkezU5IC0gbWludXRlc30gbWludXRlcy5gKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NoYWxrLnJlZC5ib2xkKGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06YCl9ICR7Y2hhbGsucmVkKGVycm9yKX1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBSZWFjaGVkIHRoaXMgaG91cidzIHVzYWdlIGxpbWl0IG9mICR7Y29uZmlnLndvcmRuaWsuZGF0ZS5saW1pdH0uYClcbiAgfVxufVxuIl19