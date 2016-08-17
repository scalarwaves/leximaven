'use strict';

/* eslint max-len:0 */
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var glob = require('glob');
var noon = require('noon');

var TDIR = null;
var dirExists = null;
try {
  fs.statSync('themes');
  dirExists = true;
} catch (e) {
  if (e.code === 'ENOENT') dirExists = false;
}
if (dirExists) {
  TDIR = 'themes/';
} else {
  var nvmbin = process.env.NVM_BIN;
  TDIR = nvmbin.replace(/bin/, 'lib/node_modules/leximaven/themes/');
}

/**
  * The themes module provides useful repetitive theme tasks
  * @module Themes
  */

/**
  * Loads theme
  * @public
  * @param {string} theme The name of the theme
  * @return {Object} load The style to use
  */
exports.loadTheme = function (theme) {
  var dirExists = null;
  var load = null;
  try {
    fs.statSync('themes');
    dirExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') dirExists = false;
  }
  dirExists ? load = noon.load('themes/' + theme + '.noon') : load = noon.load('' + TDIR + theme + '.noon');
  return load;
};

/**
  * Gets themes for list command
  * @public
  * @return {Array} List of theme names
  */
exports.getThemes = function () {
  var list = [];
  var dirExists = null;
  var files = [];
  try {
    fs.statSync('themes');
    dirExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') dirExists = false;
  }
  dirExists ? files = glob.sync('themes/*.noon') : files = glob.sync(TDIR + '*.noon');
  _.each(files, function (path) {
    var name = path.replace(/[a-z0-9\/_\.]*themes\//, '').replace(/\.noon/, '');
    list.push(name);
  });
  return list;
};

/**
  * Prints label, connector, and content
  * @public
  * @param {Object} theme The style to use
  * @param {string} direction 'down' or 'right'
  * @param {string} text The label text
  * @param {string} [content] The text the label points at
  * @return {string} The stylized string to log
  */
exports.label = function (theme, direction, text, content) {
  var pstyle = _.get(chalk, theme.prefix.style);
  var tstyle = _.get(chalk, theme.text.style);
  var sstyle = _.get(chalk, theme.suffix.style);
  var cnstyle = _.get(chalk, theme.connector.style);
  var ctstyle = _.get(chalk, theme.content.style);
  var label = '' + pstyle(theme.prefix.str) + tstyle(text) + sstyle(theme.suffix.str);
  if (direction === 'right') {
    content !== null && content !== undefined ? label = '' + label + cnstyle(theme.connector.str) + ctstyle(content) : label = '' + label;
  } else if (direction === 'down') {
    content !== null && content !== undefined ? label = label + '\n' + cnstyle(theme.connector.str) + ctstyle(content) : label = '' + label;
  } else {
    throw new Error("Unsupported label direction, use 'down' or 'right'.");
  }
  console.log(label);
  return label;
};
//# sourceMappingURL=data:application/json;base64,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aEI7QUFDQSxNQUFJLGFBQVcsT0FBTyxNQUFNLE1BQU4sQ0FBYSxHQUFwQixDQUFYLEdBQXNDLE9BQU8sSUFBUCxDQUF0QyxHQUFxRCxPQUFPLE1BQU0sTUFBTixDQUFhLEdBQXBCLENBQXpEO0FBQ0EsTUFBSSxjQUFjLE9BQWxCLEVBQTJCO0FBQ3pCLGdCQUFZLElBQVosSUFBb0IsWUFBWSxTQUFoQyxHQUE0QyxhQUFXLEtBQVgsR0FBbUIsUUFBUSxNQUFNLFNBQU4sQ0FBZ0IsR0FBeEIsQ0FBbkIsR0FBa0QsUUFBUSxPQUFSLENBQTlGLEdBQW1ILGFBQVcsS0FBOUg7QUFDRCxHQUZELE1BRU8sSUFBSSxjQUFjLE1BQWxCLEVBQTBCO0FBQy9CLGdCQUFZLElBQVosSUFBb0IsWUFBWSxTQUFoQyxHQUE0QyxRQUFXLEtBQVgsVUFBcUIsUUFBUSxNQUFNLFNBQU4sQ0FBZ0IsR0FBeEIsQ0FBckIsR0FBb0QsUUFBUSxPQUFSLENBQWhHLEdBQXFILGFBQVcsS0FBaEk7QUFDRCxHQUZNLE1BRUE7QUFBRSxVQUFNLElBQUksS0FBSixDQUFVLHFEQUFWLENBQU47QUFBd0U7QUFDakYsVUFBUSxHQUFSLENBQVksS0FBWjtBQUNBLFNBQU8sS0FBUDtBQUNELENBZEQiLCJmaWxlIjoidGhlbWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuY29uc3QgZ2xvYiA9IHJlcXVpcmUoJ2dsb2InKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5sZXQgVERJUiA9IG51bGxcbmxldCBkaXJFeGlzdHMgPSBudWxsXG50cnkge1xuICBmcy5zdGF0U3luYygndGhlbWVzJylcbiAgZGlyRXhpc3RzID0gdHJ1ZVxufSBjYXRjaCAoZSkge1xuICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykgZGlyRXhpc3RzID0gZmFsc2Vcbn1cbmlmIChkaXJFeGlzdHMpIHtcbiAgVERJUiA9ICd0aGVtZXMvJ1xufSBlbHNlIHtcbiAgY29uc3QgbnZtYmluID0gcHJvY2Vzcy5lbnYuTlZNX0JJTlxuICBURElSID0gbnZtYmluLnJlcGxhY2UoL2Jpbi8sICdsaWIvbm9kZV9tb2R1bGVzL2xleGltYXZlbi90aGVtZXMvJylcbn1cblxuLyoqXG4gICogVGhlIHRoZW1lcyBtb2R1bGUgcHJvdmlkZXMgdXNlZnVsIHJlcGV0aXRpdmUgdGhlbWUgdGFza3NcbiAgKiBAbW9kdWxlIFRoZW1lc1xuICAqL1xuXG4vKipcbiAgKiBMb2FkcyB0aGVtZVxuICAqIEBwdWJsaWNcbiAgKiBAcGFyYW0ge3N0cmluZ30gdGhlbWUgVGhlIG5hbWUgb2YgdGhlIHRoZW1lXG4gICogQHJldHVybiB7T2JqZWN0fSBsb2FkIFRoZSBzdHlsZSB0byB1c2VcbiAgKi9cbmV4cG9ydHMubG9hZFRoZW1lID0gKHRoZW1lKSA9PiB7XG4gIGxldCBkaXJFeGlzdHMgPSBudWxsXG4gIGxldCBsb2FkID0gbnVsbFxuICB0cnkge1xuICAgIGZzLnN0YXRTeW5jKCd0aGVtZXMnKVxuICAgIGRpckV4aXN0cyA9IHRydWVcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSBkaXJFeGlzdHMgPSBmYWxzZVxuICB9XG4gIGRpckV4aXN0cyA/IGxvYWQgPSBub29uLmxvYWQoYHRoZW1lcy8ke3RoZW1lfS5ub29uYCkgOiBsb2FkID0gbm9vbi5sb2FkKGAke1RESVJ9JHt0aGVtZX0ubm9vbmApXG4gIHJldHVybiBsb2FkXG59XG5cbi8qKlxuICAqIEdldHMgdGhlbWVzIGZvciBsaXN0IGNvbW1hbmRcbiAgKiBAcHVibGljXG4gICogQHJldHVybiB7QXJyYXl9IExpc3Qgb2YgdGhlbWUgbmFtZXNcbiAgKi9cbmV4cG9ydHMuZ2V0VGhlbWVzID0gKCkgPT4ge1xuICBjb25zdCBsaXN0ID0gW11cbiAgbGV0IGRpckV4aXN0cyA9IG51bGxcbiAgbGV0IGZpbGVzID0gW11cbiAgdHJ5IHtcbiAgICBmcy5zdGF0U3luYygndGhlbWVzJylcbiAgICBkaXJFeGlzdHMgPSB0cnVlXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykgZGlyRXhpc3RzID0gZmFsc2VcbiAgfVxuICBkaXJFeGlzdHMgPyBmaWxlcyA9IGdsb2Iuc3luYygndGhlbWVzLyoubm9vbicpIDogZmlsZXMgPSBnbG9iLnN5bmMoYCR7VERJUn0qLm5vb25gKVxuICBfLmVhY2goZmlsZXMsIChwYXRoKSA9PiB7XG4gICAgY29uc3QgbmFtZSA9IHBhdGgucmVwbGFjZSgvW2EtejAtOVxcL19cXC5dKnRoZW1lc1xcLy8sICcnKS5yZXBsYWNlKC9cXC5ub29uLywgJycpXG4gICAgbGlzdC5wdXNoKG5hbWUpXG4gIH0pXG4gIHJldHVybiBsaXN0XG59XG5cbi8qKlxuICAqIFByaW50cyBsYWJlbCwgY29ubmVjdG9yLCBhbmQgY29udGVudFxuICAqIEBwdWJsaWNcbiAgKiBAcGFyYW0ge09iamVjdH0gdGhlbWUgVGhlIHN0eWxlIHRvIHVzZVxuICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb24gJ2Rvd24nIG9yICdyaWdodCdcbiAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBUaGUgbGFiZWwgdGV4dFxuICAqIEBwYXJhbSB7c3RyaW5nfSBbY29udGVudF0gVGhlIHRleHQgdGhlIGxhYmVsIHBvaW50cyBhdFxuICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0eWxpemVkIHN0cmluZyB0byBsb2dcbiAgKi9cbmV4cG9ydHMubGFiZWwgPSAodGhlbWUsIGRpcmVjdGlvbiwgdGV4dCwgY29udGVudCkgPT4ge1xuICBjb25zdCBwc3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUucHJlZml4LnN0eWxlKVxuICBjb25zdCB0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUudGV4dC5zdHlsZSlcbiAgY29uc3Qgc3N0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLnN1ZmZpeC5zdHlsZSlcbiAgY29uc3QgY25zdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb25uZWN0b3Iuc3R5bGUpXG4gIGNvbnN0IGN0c3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuY29udGVudC5zdHlsZSlcbiAgbGV0IGxhYmVsID0gYCR7cHN0eWxlKHRoZW1lLnByZWZpeC5zdHIpfSR7dHN0eWxlKHRleHQpfSR7c3N0eWxlKHRoZW1lLnN1ZmZpeC5zdHIpfWBcbiAgaWYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgIGNvbnRlbnQgIT09IG51bGwgJiYgY29udGVudCAhPT0gdW5kZWZpbmVkID8gbGFiZWwgPSBgJHtsYWJlbH0ke2Nuc3R5bGUodGhlbWUuY29ubmVjdG9yLnN0cil9JHtjdHN0eWxlKGNvbnRlbnQpfWAgOiBsYWJlbCA9IGAke2xhYmVsfWBcbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdkb3duJykge1xuICAgIGNvbnRlbnQgIT09IG51bGwgJiYgY29udGVudCAhPT0gdW5kZWZpbmVkID8gbGFiZWwgPSBgJHtsYWJlbH1cXG4ke2Nuc3R5bGUodGhlbWUuY29ubmVjdG9yLnN0cil9JHtjdHN0eWxlKGNvbnRlbnQpfWAgOiBsYWJlbCA9IGAke2xhYmVsfWBcbiAgfSBlbHNlIHsgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgbGFiZWwgZGlyZWN0aW9uLCB1c2UgJ2Rvd24nIG9yICdyaWdodCcuXCIpIH1cbiAgY29uc29sZS5sb2cobGFiZWwpXG4gIHJldHVybiBsYWJlbFxufVxuIl19