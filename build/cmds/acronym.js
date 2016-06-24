'use strict';

var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var chalk = require('chalk');
var needle = require('needle');
var noon = require('noon');

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
  var tofile = { type: 'acronym', source: 'http://acronyms.silmaril.ie' };
  var ctstyle = _.get(chalk, theme.content.style);
  needle.get(url, function (error, response) {
    if (!error && response.statusCode === 200) {
      var resp = response.body;
      if (resp.acronym.found.$.n === '0') {
        console.log(ctstyle('Found 0 acronyms for ' + acronym + '.'));
      } else {
        var found = resp.acronym.found;
        console.log(ctstyle('Found ' + found.$.n + ' acronyms for ' + acronym + ':'));
        var list = found.acro;
        for (var i = 0; i <= list.length - 1; i++) {
          var item = list[i];
          process.stdout.write(ctstyle('' + item.expan));
          tofile[['expansion' + i]] = item.expan;
          if (item.comment !== '') {
            if (item.comment.a) {
              var comment = item.comment.a;
              process.stdout.write(ctstyle(' - ' + comment._ + ' - ' + comment.$.href));
              tofile[['comment' + i]] = comment._;
              tofile[['url' + i]] = comment.$.href;
            } else {
              process.stdout.write(ctstyle(' - ' + item.comment));
              tofile[['comment' + i]] = item.comment;
            }
          }
          console.log(ctstyle(' - DDC: ' + item.$.dewey));
          tofile[['DDC' + i]] = item.$.dewey;
        }
        if (argv.o) tools.outFile(argv.o, argv.f, tofile);
      }
    } else {
      console.error(chalk.red.bold('HTTP ' + response.statusCode + ':') + ' ' + chalk.red(error));
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvYWNyb255bS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQU0sU0FBUyxRQUFRLFdBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLFVBQVIsQ0FBZDs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7QUFDQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxRQUFXLFFBQVEsR0FBUixDQUFZLElBQXZCLHFCQUFOOztBQUVBLFFBQVEsT0FBUixHQUFrQixtQkFBbEI7QUFDQSxRQUFRLElBQVIsR0FBZSxVQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCO0FBQ2hCLE9BQUs7QUFDSCxXQUFPLEdBREo7QUFFSCxVQUFNLDBDQUZIO0FBR0gsYUFBUyxFQUhOO0FBSUgsVUFBTTtBQUpILEdBRFc7QUFPaEIsU0FBTztBQUNMLFdBQU8sR0FERjtBQUVMLFVBQU0sMkJBRkQ7QUFHTCxhQUFTLEtBSEo7QUFJTCxVQUFNO0FBSkQ7QUFQUyxDQUFsQjtBQWNBLFFBQVEsT0FBUixHQUFrQixVQUFDLElBQUQsRUFBVTtBQUMxQixRQUFNLFdBQU4sQ0FBa0IsS0FBbEI7QUFDQSxNQUFNLFNBQVMsS0FBSyxJQUFMLENBQVUsS0FBVixDQUFmO0FBQ0EsTUFBTSxRQUFRLE9BQU8sU0FBUCxDQUFpQixPQUFPLEtBQXhCLENBQWQ7QUFDQSxNQUFJLE9BQU8sT0FBWCxFQUFvQixPQUFPLFNBQVAsQ0FBaUIsVUFBakIsRUFBNkIsS0FBN0IsRUFBb0MsSUFBcEM7QUFDcEIsTUFBTSxVQUFVLEtBQUssT0FBTCxDQUFhLFdBQWIsRUFBaEI7QUFDQSxNQUFNLG1EQUFpRCxLQUFLLE9BQTVEO0FBQ0EsTUFBTSxTQUFTLEVBQUUsTUFBTSxTQUFSLEVBQW1CLFFBQVEsNkJBQTNCLEVBQWY7QUFDQSxNQUFNLFVBQVUsRUFBRSxHQUFGLENBQU0sS0FBTixFQUFhLE1BQU0sT0FBTixDQUFjLEtBQTNCLENBQWhCO0FBQ0EsU0FBTyxHQUFQLENBQVcsR0FBWCxFQUFnQixVQUFDLEtBQUQsRUFBUSxRQUFSLEVBQXFCO0FBQ25DLFFBQUksQ0FBQyxLQUFELElBQVUsU0FBUyxVQUFULEtBQXdCLEdBQXRDLEVBQTJDO0FBQ3pDLFVBQU0sT0FBTyxTQUFTLElBQXRCO0FBQ0EsVUFBSSxLQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLENBQW5CLENBQXFCLENBQXJCLEtBQTJCLEdBQS9CLEVBQW9DO0FBQ2xDLGdCQUFRLEdBQVIsQ0FBWSxrQ0FBZ0MsT0FBaEMsT0FBWjtBQUNELE9BRkQsTUFFTztBQUNMLFlBQU0sUUFBUSxLQUFLLE9BQUwsQ0FBYSxLQUEzQjtBQUNBLGdCQUFRLEdBQVIsQ0FBWSxtQkFBaUIsTUFBTSxDQUFOLENBQVEsQ0FBekIsc0JBQTJDLE9BQTNDLE9BQVo7QUFDQSxZQUFNLE9BQU8sTUFBTSxJQUFuQjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsS0FBSyxLQUFLLE1BQUwsR0FBYyxDQUFuQyxFQUFzQyxHQUF0QyxFQUEyQztBQUN6QyxjQUFNLE9BQU8sS0FBSyxDQUFMLENBQWI7QUFDQSxrQkFBUSxNQUFSLENBQWUsS0FBZixDQUFxQixhQUFXLEtBQUssS0FBaEIsQ0FBckI7QUFDQSxpQkFBTyxlQUFhLENBQWIsQ0FBUCxJQUE0QixLQUFLLEtBQWpDO0FBQ0EsY0FBSSxLQUFLLE9BQUwsS0FBaUIsRUFBckIsRUFBeUI7QUFDdkIsZ0JBQUksS0FBSyxPQUFMLENBQWEsQ0FBakIsRUFBb0I7QUFDbEIsa0JBQU0sVUFBVSxLQUFLLE9BQUwsQ0FBYSxDQUE3QjtBQUNBLHNCQUFRLE1BQVIsQ0FBZSxLQUFmLENBQXFCLGdCQUFjLFFBQVEsQ0FBdEIsV0FBNkIsUUFBUSxDQUFSLENBQVUsSUFBdkMsQ0FBckI7QUFDQSxxQkFBTyxhQUFXLENBQVgsQ0FBUCxJQUEwQixRQUFRLENBQWxDO0FBQ0EscUJBQU8sU0FBTyxDQUFQLENBQVAsSUFBc0IsUUFBUSxDQUFSLENBQVUsSUFBaEM7QUFDRCxhQUxELE1BS087QUFDTCxzQkFBUSxNQUFSLENBQWUsS0FBZixDQUFxQixnQkFBYyxLQUFLLE9BQW5CLENBQXJCO0FBQ0EscUJBQU8sYUFBVyxDQUFYLENBQVAsSUFBMEIsS0FBSyxPQUEvQjtBQUNEO0FBQ0Y7QUFDRCxrQkFBUSxHQUFSLENBQVkscUJBQW1CLEtBQUssQ0FBTCxDQUFPLEtBQTFCLENBQVo7QUFDQSxpQkFBTyxTQUFPLENBQVAsQ0FBUCxJQUFzQixLQUFLLENBQUwsQ0FBTyxLQUE3QjtBQUNEO0FBQ0QsWUFBSSxLQUFLLENBQVQsRUFBWSxNQUFNLE9BQU4sQ0FBYyxLQUFLLENBQW5CLEVBQXNCLEtBQUssQ0FBM0IsRUFBOEIsTUFBOUI7QUFDYjtBQUNGLEtBNUJELE1BNEJPO0FBQ0wsY0FBUSxLQUFSLENBQWlCLE1BQU0sR0FBTixDQUFVLElBQVYsV0FBdUIsU0FBUyxVQUFoQyxPQUFqQixTQUFtRSxNQUFNLEdBQU4sQ0FBVSxLQUFWLENBQW5FO0FBQ0Q7QUFDRixHQWhDRDtBQWlDRCxDQTFDRCIsImZpbGUiOiJjbWRzL2Fjcm9ueW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi90aGVtZXMnKVxuY29uc3QgdG9vbHMgPSByZXF1aXJlKCcuLi90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBuZWVkbGUgPSByZXF1aXJlKCduZWVkbGUnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcblxuZXhwb3J0cy5jb21tYW5kID0gJ2Fjcm9ueW0gPGFjcm9ueW0+J1xuZXhwb3J0cy5kZXNjID0gJ0Fjcm9ueW1zJ1xuZXhwb3J0cy5idWlsZGVyID0ge1xuICBvdXQ6IHtcbiAgICBhbGlhczogJ28nLFxuICAgIGRlc2M6ICdXcml0ZSBjc29uLCBqc29uLCBub29uLCBwbGlzdCwgeWFtbCwgeG1sJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgfSxcbiAgZm9yY2U6IHtcbiAgICBhbGlhczogJ2YnLFxuICAgIGRlc2M6ICdGb3JjZSBvdmVyd3JpdGluZyBvdXRmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICB0b29scy5jaGVja0NvbmZpZyhDRklMRSlcbiAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoY29uZmlnLnRoZW1lKVxuICBpZiAoY29uZmlnLnZlcmJvc2UpIHRoZW1lcy5sYWJlbERvd24oJ0Fjcm9ueW1zJywgdGhlbWUsIG51bGwpXG4gIGNvbnN0IGFjcm9ueW0gPSBhcmd2LmFjcm9ueW0udG9VcHBlckNhc2UoKVxuICBjb25zdCB1cmwgPSBgaHR0cDovL2Fjcm9ueW1zLnNpbG1hcmlsLmllL2NnaS1iaW4veGFhPyR7YXJndi5hY3JvbnltfWBcbiAgY29uc3QgdG9maWxlID0geyB0eXBlOiAnYWNyb255bScsIHNvdXJjZTogJ2h0dHA6Ly9hY3Jvbnltcy5zaWxtYXJpbC5pZScgfVxuICBjb25zdCBjdHN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbnRlbnQuc3R5bGUpXG4gIG5lZWRsZS5nZXQodXJsLCAoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgIGNvbnN0IHJlc3AgPSByZXNwb25zZS5ib2R5XG4gICAgICBpZiAocmVzcC5hY3JvbnltLmZvdW5kLiQubiA9PT0gJzAnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGN0c3R5bGUoYEZvdW5kIDAgYWNyb255bXMgZm9yICR7YWNyb255bX0uYCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmb3VuZCA9IHJlc3AuYWNyb255bS5mb3VuZFxuICAgICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGBGb3VuZCAke2ZvdW5kLiQubn0gYWNyb255bXMgZm9yICR7YWNyb255bX06YCkpXG4gICAgICAgIGNvbnN0IGxpc3QgPSBmb3VuZC5hY3JvXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpc3QubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShjdHN0eWxlKGAke2l0ZW0uZXhwYW59YCkpXG4gICAgICAgICAgdG9maWxlW1tgZXhwYW5zaW9uJHtpfWBdXSA9IGl0ZW0uZXhwYW5cbiAgICAgICAgICBpZiAoaXRlbS5jb21tZW50ICE9PSAnJykge1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudC5hKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbW1lbnQgPSBpdGVtLmNvbW1lbnQuYVxuICAgICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShjdHN0eWxlKGAgLSAke2NvbW1lbnQuX30gLSAke2NvbW1lbnQuJC5ocmVmfWApKVxuICAgICAgICAgICAgICB0b2ZpbGVbW2Bjb21tZW50JHtpfWBdXSA9IGNvbW1lbnQuX1xuICAgICAgICAgICAgICB0b2ZpbGVbW2B1cmwke2l9YF1dID0gY29tbWVudC4kLmhyZWZcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGN0c3R5bGUoYCAtICR7aXRlbS5jb21tZW50fWApKVxuICAgICAgICAgICAgICB0b2ZpbGVbW2Bjb21tZW50JHtpfWBdXSA9IGl0ZW0uY29tbWVudFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZyhjdHN0eWxlKGAgLSBEREM6ICR7aXRlbS4kLmRld2V5fWApKVxuICAgICAgICAgIHRvZmlsZVtbYEREQyR7aX1gXV0gPSBpdGVtLiQuZGV3ZXlcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJndi5vKSB0b29scy5vdXRGaWxlKGFyZ3YubywgYXJndi5mLCB0b2ZpbGUpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y2hhbGsucmVkLmJvbGQoYEhUVFAgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTpgKX0gJHtjaGFsay5yZWQoZXJyb3IpfWApXG4gICAgfVxuICB9KVxufVxuIl19