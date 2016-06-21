'use strict';

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
      console.log('No config found at ' + file + ', run: ' + chalk.white.bold('leximaven config init'));
      process.exit(1);
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
//# sourceMappingURL=data:application/json;base64,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TUFBaEI7QUFDQSxnQkFBUSxHQUFSLENBQVksTUFBTSxLQUFOLGdCQUF5QixJQUF6QixpQkFBWjtBQUNELE9BSEQsTUFHTztBQUNMLGdCQUFRLEdBQVIsQ0FBWSxNQUFNLEtBQU4sQ0FBZSxJQUFmLHlDQUFaO0FBQ0Q7QUFDRixLQVBELE1BT087QUFDTCxXQUFLLElBQUwsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCO0FBQ0EsY0FBUSxHQUFSLENBQVksTUFBTSxLQUFOLG9CQUE2QixJQUE3QixPQUFaO0FBQ0Q7QUFDRixHQVpNLE1BWUEsUUFBUSxHQUFSLENBQVksTUFBTSxLQUFOLGFBQXNCLEdBQXRCLHFCQUFaO0FBQ1IsQ0FuQ0QiLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuY29uc3QgeG1sMmpzID0gcmVxdWlyZSgneG1sMmpzJylcblxuLyoqXG4gICogVGhlIHRvb2xzIG1vZHVsZSBwcm92aWRlcyB1c2VmdWwgcmVwZXRpdGl2ZSB0YXNrc1xuICAqIEBtb2R1bGUgVXRpbHNcbiAgKi9cblxuLyoqXG4gICogQ2hlY2tzIGlmIGEgZmlsZSBleGlzdHNcbiAgKiBAcHJpdmF0ZVxuICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBmaWxlbmFtZSB0byBjaGVjay5cbiAgKiBAcmV0dXJuIHtib29sZWFufSBmaWxlRXhpc3RzXG4gICovXG5mdW5jdGlvbiBjaGVja091dGZpbGUocGF0aCkge1xuICBsZXQgZmlsZUV4aXN0cyA9IG51bGxcbiAgdHJ5IHtcbiAgICBmcy5zdGF0U3luYyhwYXRoKVxuICAgIGZpbGVFeGlzdHMgPSB0cnVlXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgZmlsZUV4aXN0cyA9IGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiBmaWxlRXhpc3RzXG59XG5cbi8qKlxuICAqIENvbnZlcnRzIHN0cmluZyB0byBib29sZWFuXG4gICogQHB1YmxpY1xuICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAqIEByZXR1cm4ge2Jvb2xlYW59IHZcbiAgKi9cbmV4cG9ydHMuY2hlY2tCb29sZWFuID0gKHZhbHVlKSA9PiB7XG4gIGxldCB2ID0gdmFsdWVcbiAgaWYgKHYgPT09ICd0cnVlJykgdiA9IHRydWVcbiAgaWYgKHYgPT09ICdmYWxzZScpIHYgPSBmYWxzZVxuICByZXR1cm4gdlxufVxuXG4vKipcbiAgKiBDaGVja3MgaWYgY29uZmlnIGV4aXN0cy4gSWYgbm90LCBwcmludHMgaW5pdCBtZXNzYWdlIGFuZCBleGl0cyB3aXRoIGVycm9yIGNvZGUuXG4gICogQHB1YmxpY1xuICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlIENvbmZpZ3VyYXRpb24gZmlsZXBhdGhcbiAgKi9cbmV4cG9ydHMuY2hlY2tDb25maWcgPSAoZmlsZSkgPT4ge1xuICB0cnkge1xuICAgIGZzLnN0YXRTeW5jKGZpbGUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgY29uc29sZS5sb2coYE5vIGNvbmZpZyBmb3VuZCBhdCAke2ZpbGV9LCBydW46ICR7Y2hhbGsud2hpdGUuYm9sZCgnbGV4aW1hdmVuIGNvbmZpZyBpbml0Jyl9YClcbiAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgIH0gZWxzZSB7IHRocm93IGUgfVxuICB9XG59XG5cbi8qKlxuICAqIEhhbmRsZXMgZGF0YSBleHBvcnQgdG8gZmlsZS4gU3VwcG9ydHMgY3NvbiwganNvbiwgbm9vbiwgcGxpc3QsIHhtbCwgeWFtbC5cbiAgKiBAcHVibGljXG4gICogQHBhcmFtIHtzdHJpbmd9IHBhdGggVGhlIGRlc2lyZWQgZmlsZXBhdGggYW5kIGV4dGVuc2lvblxuICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2UgV2hldGhlciB0byBmb3JjZSBvdmVyd3JpdGVcbiAgKiBAcGFyYW0ge09iamVjdH0gdG9maWxlIEEgbnVtYmVyZWQgb2JqZWN0IG9mIGRhdGEgcG9pbnRzXG4gICovXG5leHBvcnRzLm91dEZpbGUgPSAocGF0aCwgZm9yY2UsIHRvZmlsZSkgPT4ge1xuICBjb25zdCBtYXRjaCA9IHBhdGgubWF0Y2goL1xcLihbYS16XSopJC9pKVxuICBjb25zdCBleHQgPSBtYXRjaFsxXVxuICBjb25zdCBidWlsZGVyID0gbmV3IHhtbDJqcy5CdWlsZGVyKClcbiAgaWYgKGV4dCA9PT0gJ3htbCcpIHtcbiAgICBpZiAoY2hlY2tPdXRmaWxlKHBhdGgpKSB7XG4gICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgY29uc3QgeG1sID0gYnVpbGRlci5idWlsZE9iamVjdCh0b2ZpbGUpXG4gICAgICAgIGNvbnN0IGZkID0gZnMub3BlblN5bmMocGF0aCwgJ3crJylcbiAgICAgICAgZnMud3JpdGVTeW5jKGZkLCB4bWwpXG4gICAgICAgIGZzLmNsb3NlU3luYyhmZClcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYE92ZXJ3cm90ZSAke3BhdGh9IHdpdGggZGF0YS5gKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGAke3BhdGh9IGV4aXN0cywgdXNlIC1mIHRvIGZvcmNlIG92ZXJ3cml0ZS5gKSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgeG1sID0gYnVpbGRlci5idWlsZE9iamVjdCh0b2ZpbGUpXG4gICAgICBjb25zdCBmZCA9IGZzLm9wZW5TeW5jKHBhdGgsICd3KycpXG4gICAgICBmcy53cml0ZVN5bmMoZmQsIHhtbClcbiAgICAgIGZzLmNsb3NlU3luYyhmZClcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBXcm90ZSBkYXRhIHRvICR7cGF0aH0uYCkpXG4gICAgfVxuICB9IGVsc2UgaWYgKGV4dCA9PT0gJ2Nzb24nIHx8ICdqc29uJyB8fCAnbm9vbicgfHwgJ3BsaXN0JyB8fCAneW1sJyB8fCAneWFtbCcpIHtcbiAgICBpZiAoY2hlY2tPdXRmaWxlKHBhdGgpKSB7XG4gICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgbm9vbi5zYXZlKHBhdGgsIHRvZmlsZSlcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYE92ZXJ3cm90ZSAke3BhdGh9IHdpdGggZGF0YS5gKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGAke3BhdGh9IGV4aXN0cywgdXNlIC1mIHRvIGZvcmNlIG92ZXJ3cml0ZS5gKSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbm9vbi5zYXZlKHBhdGgsIHRvZmlsZSlcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBXcm90ZSBkYXRhIHRvICR7cGF0aH0uYCkpXG4gICAgfVxuICB9IGVsc2UgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYEZvcm1hdCAke2V4dH0gbm90IHN1cHBvcnRlZC5gKSlcbn1cbiJdfQ==