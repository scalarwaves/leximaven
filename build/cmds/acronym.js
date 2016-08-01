'use strict';

var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var chalk = require('chalk');
var http = require('good-guy-http')();
var noon = require('noon');
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'acronym <acronym>';
exports.desc = 'Acronyms';
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
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.labelDown('Acronyms', theme, null);
  var acronym = argv.acronym.toUpperCase();
  var url = 'http://acronyms.silmaril.ie/cgi-bin/xaa?' + argv.acronym;
  var tofile = {
    type: 'acronym',
    source: 'http://acronyms.silmaril.ie',
    url: url
  };
  var ctstyle = _.get(chalk, theme.content.style);
  http({ url: url }, function (error, response) {
    if (!error && response.statusCode === 200) {
      var body = response.body;
      var parser = new xml2js.Parser();
      parser.parseString(body, function (err, result) {
        var found = result.acronym.found[0];
        var count = found.$;
        if (count.n === '0') {
          console.log(ctstyle('Found 0 acronyms for ' + acronym + '.'));
        } else {
          console.log(ctstyle('Found ' + count.n + ' acronyms for ' + acronym + ':'));
          var list = found.acro;
          for (var i = 0; i <= list.length - 1; i++) {
            var item = list[i];
            process.stdout.write(ctstyle('' + item.expan));
            tofile[['expansion' + i]] = item.expan[0];
            var comm = item.comment[0];
            if (comm !== '') {
              if (comm.a) {
                var comment = comm.a[0];
                process.stdout.write(ctstyle(' - ' + comment._ + ' - ' + comment.$.href));
                tofile[['comment' + i]] = comment._;
                tofile[['url' + i]] = comment.$.href;
              } else {
                process.stdout.write(ctstyle(' - ' + comm));
                tofile[['comment' + i]] = item.comment[0];
              }
            }
            console.log(ctstyle(' - DDC: ' + item.$.dewey));
            tofile[['DDC' + i]] = item.$.dewey;
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
        }
      });
    } else {
      throw new Error('HTTP ' + response.statusCode + ': ' + error);
    }
  });
};
//# sourceMappingURL=data:application/json;base64,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TCxDQUFPLENBQVAsQ0FBaEI7QUFDQSx3QkFBUSxNQUFSLENBQWUsS0FBZixDQUFxQixnQkFBYyxRQUFRLENBQXRCLFdBQTZCLFFBQVEsQ0FBUixDQUFVLElBQXZDLENBQXJCO0FBQ0EsdUJBQU8sYUFBVyxDQUFYLENBQVAsSUFBMEIsUUFBUSxDQUFsQztBQUNBLHVCQUFPLFNBQU8sQ0FBUCxDQUFQLElBQXNCLFFBQVEsQ0FBUixDQUFVLElBQWhDO0FBQ0QsZUFMRCxNQUtPO0FBQ0wsd0JBQVEsTUFBUixDQUFlLEtBQWYsQ0FBcUIsZ0JBQWMsSUFBZCxDQUFyQjtBQUNBLHVCQUFPLGFBQVcsQ0FBWCxDQUFQLElBQTBCLEtBQUssT0FBTCxDQUFhLENBQWIsQ0FBMUI7QUFDRDtBQUNGO0FBQ0Qsb0JBQVEsR0FBUixDQUFZLHFCQUFtQixLQUFLLENBQUwsQ0FBTyxLQUExQixDQUFaO0FBQ0EsbUJBQU8sU0FBTyxDQUFQLENBQVAsSUFBc0IsS0FBSyxDQUFMLENBQU8sS0FBN0I7QUFDRDtBQUNELGNBQUksS0FBSyxDQUFULEVBQVksTUFBTSxPQUFOLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCLEVBQThCLE1BQTlCO0FBQ2I7QUFDRixPQTdCRDtBQThCRCxLQWpDRCxNQWlDTztBQUNMLFlBQU0sSUFBSSxLQUFKLFdBQWtCLFNBQVMsVUFBM0IsVUFBMEMsS0FBMUMsQ0FBTjtBQUNEO0FBQ0YsR0FyQ0Q7QUFzQ0QsQ0FuREQiLCJmaWxlIjoiY21kcy9hY3JvbnltLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vdGhlbWVzJylcbmNvbnN0IHRvb2xzID0gcmVxdWlyZSgnLi4vdG9vbHMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2dvb2QtZ3V5LWh0dHAnKSgpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5jb25zdCB4bWwyanMgPSByZXF1aXJlKCd4bWwyanMnKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ2Fjcm9ueW0gPGFjcm9ueW0+J1xuZXhwb3J0cy5kZXNjID0gJ0Fjcm9ueW1zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ0Fjcm9ueW1zJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IGFjcm9ueW0gPSBhcmd2LmFjcm9ueW0udG9VcHBlckNhc2UoKVxuICBjb25zdCB1cmwgPSBgaHR0cDovL2Fjcm9ueW1zLnNpbG1hcmlsLmllL2NnaS1iaW4veGFhPyR7YXJndi5hY3JvbnltfWBcbiAgY29uc3QgdG9maWxlID0ge1xuICAgIHR5cGU6ICdhY3JvbnltJyxcbiAgICBzb3VyY2U6ICdodHRwOi8vYWNyb255bXMuc2lsbWFyaWwuaWUnLFxuICAgIHVybCxcbiAgfVxuICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gIGh0dHAoeyB1cmwgfSwgKGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICBjb25zdCBib2R5ID0gcmVzcG9uc2UuYm9keVxuICAgICAgY29uc3QgcGFyc2VyID0gbmV3IHhtbDJqcy5QYXJzZXIoKVxuICAgICAgcGFyc2VyLnBhcnNlU3RyaW5nKGJvZHksIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICBjb25zdCBmb3VuZCA9IHJlc3VsdC5hY3JvbnltLmZvdW5kWzBdXG4gICAgICAgIGNvbnN0IGNvdW50ID0gZm91bmQuJFxuICAgICAgICBpZiAoY291bnQubiA9PT0gJzAnKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY3RzdHlsZShgRm91bmQgMCBhY3JvbnltcyBmb3IgJHthY3JvbnltfS5gKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGBGb3VuZCAke2NvdW50Lm59IGFjcm9ueW1zIGZvciAke2Fjcm9ueW19OmApKVxuICAgICAgICAgIGNvbnN0IGxpc3QgPSBmb3VuZC5hY3JvXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGlzdC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldXG4gICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShjdHN0eWxlKGAke2l0ZW0uZXhwYW59YCkpXG4gICAgICAgICAgICB0b2ZpbGVbW2BleHBhbnNpb24ke2l9YF1dID0gaXRlbS5leHBhblswXVxuICAgICAgICAgICAgY29uc3QgY29tbSA9IGl0ZW0uY29tbWVudFswXVxuICAgICAgICAgICAgaWYgKGNvbW0gIT09ICcnKSB7XG4gICAgICAgICAgICAgIGlmIChjb21tLmEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21tZW50ID0gY29tbS5hWzBdXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoY3RzdHlsZShgIC0gJHtjb21tZW50Ll99IC0gJHtjb21tZW50LiQuaHJlZn1gKSlcbiAgICAgICAgICAgICAgICB0b2ZpbGVbW2Bjb21tZW50JHtpfWBdXSA9IGNvbW1lbnQuX1xuICAgICAgICAgICAgICAgIHRvZmlsZVtbYHVybCR7aX1gXV0gPSBjb21tZW50LiQuaHJlZlxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGN0c3R5bGUoYCAtICR7Y29tbX1gKSlcbiAgICAgICAgICAgICAgICB0b2ZpbGVbW2Bjb21tZW50JHtpfWBdXSA9IGl0ZW0uY29tbWVudFswXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGAgLSBEREM6ICR7aXRlbS4kLmRld2V5fWApKVxuICAgICAgICAgICAgdG9maWxlW1tgRERDJHtpfWBdXSA9IGl0ZW0uJC5kZXdleVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OiAke2Vycm9yfWApXG4gICAgfVxuICB9KVxufVxuIl19