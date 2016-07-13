'use strict';

/* eslint max-len: 0 */
var chalk = require('chalk');
var fs = require('fs');
var noon = require('noon');
var xml2js = require('xml2js');

/**
  * The tools module provides useful repetitive tasks
  * @module Utils
  */

/**
  * Checks if a file exists
  * @private
  * @param {string} path The filename to check.
  * @return {boolean} fileExists
  */
function checkOutfile(path) {
  var fileExists = null;
  try {
    fs.statSync(path);
    fileExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      fileExists = false;
    }
  }
  return fileExists;
}

/**
  * Converts string to boolean
  * @public
  * @param {string} value
  * @return {boolean} v
  */
exports.checkBoolean = function (value) {
  var v = value;
  if (v === 'true') v = true;
  if (v === 'false') v = false;
  return v;
};

/**
  * Checks if config exists. If not, prints init message and exits with error code.
  * @public
  * @param {string} file Configuration filepath
  */
exports.checkConfig = function (file) {
  try {
    fs.statSync(file);
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error('No config found at ' + file + ', run: ' + chalk.white.bold('leximaven config init'));
    } else {
      throw e;
    }
  }
};

/**
  * Handles data export to file. Supports cson, json, noon, plist, xml, yaml.
  * @public
  * @param {string} path The desired filepath and extension
  * @param {boolean} force Whether to force overwrite
  * @param {Object} tofile A numbered object of data points
  */
exports.outFile = function (path, force, tofile) {
  var match = path.match(/\.([a-z]*)$/i);
  var ext = match[1];
  var builder = new xml2js.Builder();
  if (ext === 'xml') {
    if (checkOutfile(path)) {
      if (force) {
        var xml = builder.buildObject(tofile);
        var fd = fs.openSync(path, 'w+');
        fs.writeSync(fd, xml);
        fs.closeSync(fd);
        console.log(chalk.white('Overwrote ' + path + ' with data.'));
      } else {
        console.log(chalk.white(path + ' exists, use -f to force overwrite.'));
      }
    } else {
      var _xml = builder.buildObject(tofile);
      var _fd = fs.openSync(path, 'w+');
      fs.writeSync(_fd, _xml);
      fs.closeSync(_fd);
      console.log(chalk.white('Wrote data to ' + path + '.'));
    }
  } else if (ext === 'cson' || 'json' || 'noon' || 'plist' || 'yml' || 'yaml') {
    if (checkOutfile(path)) {
      if (force) {
        noon.save(path, tofile);
        console.log(chalk.white('Overwrote ' + path + ' with data.'));
      } else {
        console.log(chalk.white(path + ' exists, use -f to force overwrite.'));
      }
    } else {
      noon.save(path, tofile);
      console.log(chalk.white('Wrote data to ' + path + '.'));
    }
  } else console.log(chalk.white('Format ' + ext + ' not supported.'));
};
//# sourceMappingURL=data:application/json;base64,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QVEsR0FBUixDQUFZLE1BQU0sS0FBTixnQkFBeUIsSUFBekIsaUJBQVo7QUFDRCxPQUhELE1BR087QUFDTCxnQkFBUSxHQUFSLENBQVksTUFBTSxLQUFOLENBQWUsSUFBZix5Q0FBWjtBQUNEO0FBQ0YsS0FQRCxNQU9PO0FBQ0wsV0FBSyxJQUFMLENBQVUsSUFBVixFQUFnQixNQUFoQjtBQUNBLGNBQVEsR0FBUixDQUFZLE1BQU0sS0FBTixvQkFBNkIsSUFBN0IsT0FBWjtBQUNEO0FBQ0YsR0FaTSxNQVlBLFFBQVEsR0FBUixDQUFZLE1BQU0sS0FBTixhQUFzQixHQUF0QixxQkFBWjtBQUNSLENBbkNEIiwiZmlsZSI6InRvb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46IDAgKi9cbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5jb25zdCB4bWwyanMgPSByZXF1aXJlKCd4bWwyanMnKVxuXG4vKipcbiAgKiBUaGUgdG9vbHMgbW9kdWxlIHByb3ZpZGVzIHVzZWZ1bCByZXBldGl0aXZlIHRhc2tzXG4gICogQG1vZHVsZSBVdGlsc1xuICAqL1xuXG4vKipcbiAgKiBDaGVja3MgaWYgYSBmaWxlIGV4aXN0c1xuICAqIEBwcml2YXRlXG4gICogQHBhcmFtIHtzdHJpbmd9IHBhdGggVGhlIGZpbGVuYW1lIHRvIGNoZWNrLlxuICAqIEByZXR1cm4ge2Jvb2xlYW59IGZpbGVFeGlzdHNcbiAgKi9cbmZ1bmN0aW9uIGNoZWNrT3V0ZmlsZShwYXRoKSB7XG4gIGxldCBmaWxlRXhpc3RzID0gbnVsbFxuICB0cnkge1xuICAgIGZzLnN0YXRTeW5jKHBhdGgpXG4gICAgZmlsZUV4aXN0cyA9IHRydWVcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICBmaWxlRXhpc3RzID0gZmFsc2VcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbGVFeGlzdHNcbn1cblxuLyoqXG4gICogQ29udmVydHMgc3RyaW5nIHRvIGJvb2xlYW5cbiAgKiBAcHVibGljXG4gICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICogQHJldHVybiB7Ym9vbGVhbn0gdlxuICAqL1xuZXhwb3J0cy5jaGVja0Jvb2xlYW4gPSAodmFsdWUpID0+IHtcbiAgbGV0IHYgPSB2YWx1ZVxuICBpZiAodiA9PT0gJ3RydWUnKSB2ID0gdHJ1ZVxuICBpZiAodiA9PT0gJ2ZhbHNlJykgdiA9IGZhbHNlXG4gIHJldHVybiB2XG59XG5cbi8qKlxuICAqIENoZWNrcyBpZiBjb25maWcgZXhpc3RzLiBJZiBub3QsIHByaW50cyBpbml0IG1lc3NhZ2UgYW5kIGV4aXRzIHdpdGggZXJyb3IgY29kZS5cbiAgKiBAcHVibGljXG4gICogQHBhcmFtIHtzdHJpbmd9IGZpbGUgQ29uZmlndXJhdGlvbiBmaWxlcGF0aFxuICAqL1xuZXhwb3J0cy5jaGVja0NvbmZpZyA9IChmaWxlKSA9PiB7XG4gIHRyeSB7XG4gICAgZnMuc3RhdFN5bmMoZmlsZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGNvbmZpZyBmb3VuZCBhdCAke2ZpbGV9LCBydW46ICR7Y2hhbGsud2hpdGUuYm9sZCgnbGV4aW1hdmVuIGNvbmZpZyBpbml0Jyl9YClcbiAgICB9IGVsc2UgeyB0aHJvdyBlIH1cbiAgfVxufVxuXG4vKipcbiAgKiBIYW5kbGVzIGRhdGEgZXhwb3J0IHRvIGZpbGUuIFN1cHBvcnRzIGNzb24sIGpzb24sIG5vb24sIHBsaXN0LCB4bWwsIHlhbWwuXG4gICogQHB1YmxpY1xuICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBkZXNpcmVkIGZpbGVwYXRoIGFuZCBleHRlbnNpb25cbiAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlIFdoZXRoZXIgdG8gZm9yY2Ugb3ZlcndyaXRlXG4gICogQHBhcmFtIHtPYmplY3R9IHRvZmlsZSBBIG51bWJlcmVkIG9iamVjdCBvZiBkYXRhIHBvaW50c1xuICAqL1xuZXhwb3J0cy5vdXRGaWxlID0gKHBhdGgsIGZvcmNlLCB0b2ZpbGUpID0+IHtcbiAgY29uc3QgbWF0Y2ggPSBwYXRoLm1hdGNoKC9cXC4oW2Etel0qKSQvaSlcbiAgY29uc3QgZXh0ID0gbWF0Y2hbMV1cbiAgY29uc3QgYnVpbGRlciA9IG5ldyB4bWwyanMuQnVpbGRlcigpXG4gIGlmIChleHQgPT09ICd4bWwnKSB7XG4gICAgaWYgKGNoZWNrT3V0ZmlsZShwYXRoKSkge1xuICAgICAgaWYgKGZvcmNlKSB7XG4gICAgICAgIGNvbnN0IHhtbCA9IGJ1aWxkZXIuYnVpbGRPYmplY3QodG9maWxlKVxuICAgICAgICBjb25zdCBmZCA9IGZzLm9wZW5TeW5jKHBhdGgsICd3KycpXG4gICAgICAgIGZzLndyaXRlU3luYyhmZCwgeG1sKVxuICAgICAgICBmcy5jbG9zZVN5bmMoZmQpXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBPdmVyd3JvdGUgJHtwYXRofSB3aXRoIGRhdGEuYCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgJHtwYXRofSBleGlzdHMsIHVzZSAtZiB0byBmb3JjZSBvdmVyd3JpdGUuYCkpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHhtbCA9IGJ1aWxkZXIuYnVpbGRPYmplY3QodG9maWxlKVxuICAgICAgY29uc3QgZmQgPSBmcy5vcGVuU3luYyhwYXRoLCAndysnKVxuICAgICAgZnMud3JpdGVTeW5jKGZkLCB4bWwpXG4gICAgICBmcy5jbG9zZVN5bmMoZmQpXG4gICAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgV3JvdGUgZGF0YSB0byAke3BhdGh9LmApKVxuICAgIH1cbiAgfSBlbHNlIGlmIChleHQgPT09ICdjc29uJyB8fCAnanNvbicgfHwgJ25vb24nIHx8ICdwbGlzdCcgfHwgJ3ltbCcgfHwgJ3lhbWwnKSB7XG4gICAgaWYgKGNoZWNrT3V0ZmlsZShwYXRoKSkge1xuICAgICAgaWYgKGZvcmNlKSB7XG4gICAgICAgIG5vb24uc2F2ZShwYXRoLCB0b2ZpbGUpXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBPdmVyd3JvdGUgJHtwYXRofSB3aXRoIGRhdGEuYCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgJHtwYXRofSBleGlzdHMsIHVzZSAtZiB0byBmb3JjZSBvdmVyd3JpdGUuYCkpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vb24uc2F2ZShwYXRoLCB0b2ZpbGUpXG4gICAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgV3JvdGUgZGF0YSB0byAke3BhdGh9LmApKVxuICAgIH1cbiAgfSBlbHNlIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBGb3JtYXQgJHtleHR9IG5vdCBzdXBwb3J0ZWQuYCkpXG59XG4iXX0=