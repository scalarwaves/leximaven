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
//# sourceMappingURL=data:application/json;base64,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QVYsRUFBZ0IsTUFBaEI7QUFDQSxnQkFBUSxHQUFSLENBQVksTUFBTSxLQUFOLGdCQUF5QixJQUF6QixpQkFBWjtBQUNELE9BSEQsTUFHTztBQUNMLGdCQUFRLEdBQVIsQ0FBWSxNQUFNLEtBQU4sQ0FBZSxJQUFmLHlDQUFaO0FBQ0Q7QUFDRixLQVBELE1BT087QUFDTCxXQUFLLElBQUwsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCO0FBQ0EsY0FBUSxHQUFSLENBQVksTUFBTSxLQUFOLG9CQUE2QixJQUE3QixPQUFaO0FBQ0Q7QUFDRixHQVpNLE1BWUEsUUFBUSxHQUFSLENBQVksTUFBTSxLQUFOLGFBQXNCLEdBQXRCLHFCQUFaO0FBQ1IsQ0FuQ0QiLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjogMCAqL1xuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcbmNvbnN0IHhtbDJqcyA9IHJlcXVpcmUoJ3htbDJqcycpXG5cbi8qKlxuICAqIFRoZSB0b29scyBtb2R1bGUgcHJvdmlkZXMgdXNlZnVsIHJlcGV0aXRpdmUgdGFza3NcbiAgKiBAbW9kdWxlIFV0aWxzXG4gICovXG5cbi8qKlxuICAqIENoZWNrcyBpZiBhIGZpbGUgZXhpc3RzXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgZmlsZW5hbWUgdG8gY2hlY2suXG4gICogQHJldHVybiB7Ym9vbGVhbn0gZmlsZUV4aXN0c1xuICAqL1xuZnVuY3Rpb24gY2hlY2tPdXRmaWxlKHBhdGgpIHtcbiAgbGV0IGZpbGVFeGlzdHMgPSBudWxsXG4gIHRyeSB7XG4gICAgZnMuc3RhdFN5bmMocGF0aClcbiAgICBmaWxlRXhpc3RzID0gdHJ1ZVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgIGZpbGVFeGlzdHMgPSBmYWxzZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmlsZUV4aXN0c1xufVxuXG4vKipcbiAgKiBDb252ZXJ0cyBzdHJpbmcgdG8gYm9vbGVhblxuICAqIEBwdWJsaWNcbiAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgKiBAcmV0dXJuIHtib29sZWFufSB2XG4gICovXG5leHBvcnRzLmNoZWNrQm9vbGVhbiA9ICh2YWx1ZSkgPT4ge1xuICBsZXQgdiA9IHZhbHVlXG4gIGlmICh2ID09PSAndHJ1ZScpIHYgPSB0cnVlXG4gIGlmICh2ID09PSAnZmFsc2UnKSB2ID0gZmFsc2VcbiAgcmV0dXJuIHZcbn1cblxuLyoqXG4gICogQ2hlY2tzIGlmIGNvbmZpZyBleGlzdHMuIElmIG5vdCwgcHJpbnRzIGluaXQgbWVzc2FnZSBhbmQgZXhpdHMgd2l0aCBlcnJvciBjb2RlLlxuICAqIEBwdWJsaWNcbiAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZSBDb25maWd1cmF0aW9uIGZpbGVwYXRoXG4gICovXG5leHBvcnRzLmNoZWNrQ29uZmlnID0gKGZpbGUpID0+IHtcbiAgdHJ5IHtcbiAgICBmcy5zdGF0U3luYyhmaWxlKVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gY29uZmlnIGZvdW5kIGF0ICR7ZmlsZX0sIHJ1bjogJHtjaGFsay53aGl0ZS5ib2xkKCdsZXhpbWF2ZW4gY29uZmlnIGluaXQnKX1gKVxuICAgIH0gZWxzZSB7IHRocm93IGUgfVxuICB9XG59XG5cbi8qKlxuICAqIEhhbmRsZXMgZGF0YSBleHBvcnQgdG8gZmlsZS4gU3VwcG9ydHMgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHhtbCwgeWFtbC5cbiAgKiBAcHVibGljXG4gICogQHBhcmFtIHtzdHJpbmd9IHBhdGggVGhlIGRlc2lyZWQgZmlsZXBhdGggYW5kIGV4dGVuc2lvblxuICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2UgV2hldGhlciB0byBmb3JjZSBvdmVyd3JpdGVcbiAgKiBAcGFyYW0ge09iamVjdH0gdG9maWxlIEEgbnVtYmVyZWQgb2JqZWN0IG9mIGRhdGEgcG9pbnRzXG4gICovXG5leHBvcnRzLm91dEZpbGUgPSAocGF0aCwgZm9yY2UsIHRvZmlsZSkgPT4ge1xuICBjb25zdCBtYXRjaCA9IHBhdGgubWF0Y2goL1xcLihbYS16XSopJC9pKVxuICBjb25zdCBleHQgPSBtYXRjaFsxXVxuICBjb25zdCBidWlsZGVyID0gbmV3IHhtbDJqcy5CdWlsZGVyKClcbiAgaWYgKGV4dCA9PT0gJ3htbCcpIHtcbiAgICBpZiAoY2hlY2tPdXRmaWxlKHBhdGgpKSB7XG4gICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgY29uc3QgeG1sID0gYnVpbGRlci5idWlsZE9iamVjdCh0b2ZpbGUpXG4gICAgICAgIGNvbnN0IGZkID0gZnMub3BlblN5bmMocGF0aCwgJ3crJylcbiAgICAgICAgZnMud3JpdGVTeW5jKGZkLCB4bWwpXG4gICAgICAgIGZzLmNsb3NlU3luYyhmZClcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYE92ZXJ3cm90ZSAke3BhdGh9IHdpdGggZGF0YS5gKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGAke3BhdGh9IGV4aXN0cywgdXNlIC1mIHRvIGZvcmNlIG92ZXJ3cml0ZS5gKSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgeG1sID0gYnVpbGRlci5idWlsZE9iamVjdCh0b2ZpbGUpXG4gICAgICBjb25zdCBmZCA9IGZzLm9wZW5TeW5jKHBhdGgsICd3KycpXG4gICAgICBmcy53cml0ZVN5bmMoZmQsIHhtbClcbiAgICAgIGZzLmNsb3NlU3luYyhmZClcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBXcm90ZSBkYXRhIHRvICR7cGF0aH0uYCkpXG4gICAgfVxuICB9IGVsc2UgaWYgKGV4dCA9PT0gJ2Nzb24nIHx8ICdqc29uJyB8fCAnbm9vbicgfHwgJ3BsaXN0JyB8fCAneW1sJyB8fCAneWFtbCcpIHtcbiAgICBpZiAoY2hlY2tPdXRmaWxlKHBhdGgpKSB7XG4gICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgbm9vbi5zYXZlKHBhdGgsIHRvZmlsZSlcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYE92ZXJ3cm90ZSAke3BhdGh9IHdpdGggZGF0YS5gKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGAke3BhdGh9IGV4aXN0cywgdXNlIC1mIHRvIGZvcmNlIG92ZXJ3cml0ZS5gKSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbm9vbi5zYXZlKHBhdGgsIHRvZmlsZSlcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBXcm90ZSBkYXRhIHRvICR7cGF0aH0uYCkpXG4gICAgfVxuICB9IGVsc2UgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYEZvcm1hdCAke2V4dH0gbm90IHN1cHBvcnRlZC5gKSlcbn1cbiJdfQ==