'use strict';

/* eslint max-len:0 */
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var glob = require('glob');
var noon = require('noon');

var TDIR = null;
var themeDirExists = null;
try {
  fs.statSync('themes');
  themeDirExists = true;
} catch (e) {
  if (e.code === 'ENOENT') themeDirExists = false;
}
themeDirExists ? TDIR = 'themes/' : TDIR = process.env.NODE_PATH + '/leximaven/themes/';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRoZW1lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTSxLQUFLLFFBQVEsSUFBUixDQUFYO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiO0FBQ0EsSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFiOztBQUVBLElBQUksT0FBTyxJQUFYO0FBQ0EsSUFBSSxpQkFBaUIsSUFBckI7QUFDQSxJQUFJO0FBQ0YsS0FBRyxRQUFILENBQVksUUFBWjtBQUNBLG1CQUFpQixJQUFqQjtBQUNELENBSEQsQ0FHRSxPQUFPLENBQVAsRUFBVTtBQUNWLE1BQUksRUFBRSxJQUFGLEtBQVcsUUFBZixFQUF5QixpQkFBaUIsS0FBakI7QUFDMUI7QUFDRCxpQkFBaUIsT0FBTyxTQUF4QixHQUFvQyxPQUFVLFFBQVEsR0FBUixDQUFZLFNBQXRCLHVCQUFwQzs7QUFFQTs7Ozs7QUFLQTs7Ozs7O0FBTUEsUUFBUSxTQUFSLEdBQW9CLFVBQUMsS0FBRCxFQUFXO0FBQzdCLE1BQUksWUFBWSxJQUFoQjtBQUNBLE1BQUksT0FBTyxJQUFYO0FBQ0EsTUFBSTtBQUNGLE9BQUcsUUFBSCxDQUFZLFFBQVo7QUFDQSxnQkFBWSxJQUFaO0FBQ0QsR0FIRCxDQUdFLE9BQU8sQ0FBUCxFQUFVO0FBQ1YsUUFBSSxFQUFFLElBQUYsS0FBVyxRQUFmLEVBQXlCLFlBQVksS0FBWjtBQUMxQjtBQUNELGNBQVksT0FBTyxLQUFLLElBQUwsYUFBb0IsS0FBcEIsV0FBbkIsR0FBdUQsT0FBTyxLQUFLLElBQUwsTUFBYSxJQUFiLEdBQW9CLEtBQXBCLFdBQTlEO0FBQ0EsU0FBTyxJQUFQO0FBQ0QsQ0FYRDs7QUFhQTs7Ozs7QUFLQSxRQUFRLFNBQVIsR0FBb0IsWUFBTTtBQUN4QixNQUFNLE9BQU8sRUFBYjtBQUNBLE1BQUksWUFBWSxJQUFoQjtBQUNBLE1BQUksUUFBUSxFQUFaO0FBQ0EsTUFBSTtBQUNGLE9BQUcsUUFBSCxDQUFZLFFBQVo7QUFDQSxnQkFBWSxJQUFaO0FBQ0QsR0FIRCxDQUdFLE9BQU8sQ0FBUCxFQUFVO0FBQ1YsUUFBSSxFQUFFLElBQUYsS0FBVyxRQUFmLEVBQXlCLFlBQVksS0FBWjtBQUMxQjtBQUNELGNBQVksUUFBUSxLQUFLLElBQUwsQ0FBVSxlQUFWLENBQXBCLEdBQWlELFFBQVEsS0FBSyxJQUFMLENBQWEsSUFBYixZQUF6RDtBQUNBLElBQUUsSUFBRixDQUFPLEtBQVAsRUFBYyxVQUFDLElBQUQsRUFBVTtBQUN0QixRQUFNLE9BQU8sS0FBSyxPQUFMLENBQWEsd0JBQWIsRUFBdUMsRUFBdkMsRUFBMkMsT0FBM0MsQ0FBbUQsUUFBbkQsRUFBNkQsRUFBN0QsQ0FBYjtBQUNBLFNBQUssSUFBTCxDQUFVLElBQVY7QUFDRCxHQUhEO0FBSUEsU0FBTyxJQUFQO0FBQ0QsQ0FoQkQ7O0FBa0JBOzs7Ozs7Ozs7QUFTQSxRQUFRLEtBQVIsR0FBZ0IsVUFBQyxLQUFELEVBQVEsU0FBUixFQUFtQixJQUFuQixFQUF5QixPQUF6QixFQUFxQztBQUNuRCxNQUFNLFNBQVMsRUFBRSxHQUFGLENBQU0sS0FBTixFQUFhLE1BQU0sTUFBTixDQUFhLEtBQTFCLENBQWY7QUFDQSxNQUFNLFNBQVMsRUFBRSxHQUFGLENBQU0sS0FBTixFQUFhLE1BQU0sSUFBTixDQUFXLEtBQXhCLENBQWY7QUFDQSxNQUFNLFNBQVMsRUFBRSxHQUFGLENBQU0sS0FBTixFQUFhLE1BQU0sTUFBTixDQUFhLEtBQTFCLENBQWY7QUFDQSxNQUFNLFVBQVUsRUFBRSxHQUFGLENBQU0sS0FBTixFQUFhLE1BQU0sU0FBTixDQUFnQixLQUE3QixDQUFoQjtBQUNBLE1BQU0sVUFBVSxFQUFFLEdBQUYsQ0FBTSxLQUFOLEVBQWEsTUFBTSxPQUFOLENBQWMsS0FBM0IsQ0FBaEI7QUFDQSxNQUFJLGFBQVcsT0FBTyxNQUFNLE1BQU4sQ0FBYSxHQUFwQixDQUFYLEdBQXNDLE9BQU8sSUFBUCxDQUF0QyxHQUFxRCxPQUFPLE1BQU0sTUFBTixDQUFhLEdBQXBCLENBQXpEO0FBQ0EsTUFBSSxjQUFjLE9BQWxCLEVBQTJCO0FBQ3pCLGdCQUFZLElBQVosSUFBb0IsWUFBWSxTQUFoQyxHQUE0QyxhQUFXLEtBQVgsR0FBbUIsUUFBUSxNQUFNLFNBQU4sQ0FBZ0IsR0FBeEIsQ0FBbkIsR0FBa0QsUUFBUSxPQUFSLENBQTlGLEdBQW1ILGFBQVcsS0FBOUg7QUFDRCxHQUZELE1BRU8sSUFBSSxjQUFjLE1BQWxCLEVBQTBCO0FBQy9CLGdCQUFZLElBQVosSUFBb0IsWUFBWSxTQUFoQyxHQUE0QyxRQUFXLEtBQVgsVUFBcUIsUUFBUSxNQUFNLFNBQU4sQ0FBZ0IsR0FBeEIsQ0FBckIsR0FBb0QsUUFBUSxPQUFSLENBQWhHLEdBQXFILGFBQVcsS0FBaEk7QUFDRCxHQUZNLE1BRUE7QUFBRSxVQUFNLElBQUksS0FBSixDQUFVLHFEQUFWLENBQU47QUFBd0U7QUFDakYsVUFBUSxHQUFSLENBQVksS0FBWjtBQUNBLFNBQU8sS0FBUDtBQUNELENBZEQiLCJmaWxlIjoidGhlbWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46MCAqL1xuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuY29uc3QgZ2xvYiA9IHJlcXVpcmUoJ2dsb2InKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuXG5sZXQgVERJUiA9IG51bGxcbmxldCB0aGVtZURpckV4aXN0cyA9IG51bGxcbnRyeSB7XG4gIGZzLnN0YXRTeW5jKCd0aGVtZXMnKVxuICB0aGVtZURpckV4aXN0cyA9IHRydWVcbn0gY2F0Y2ggKGUpIHtcbiAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHRoZW1lRGlyRXhpc3RzID0gZmFsc2Vcbn1cbnRoZW1lRGlyRXhpc3RzID8gVERJUiA9ICd0aGVtZXMvJyA6IFRESVIgPSBgJHtwcm9jZXNzLmVudi5OT0RFX1BBVEh9L2xleGltYXZlbi90aGVtZXMvYFxuXG4vKipcbiAgKiBUaGUgdGhlbWVzIG1vZHVsZSBwcm92aWRlcyB1c2VmdWwgcmVwZXRpdGl2ZSB0aGVtZSB0YXNrc1xuICAqIEBtb2R1bGUgVGhlbWVzXG4gICovXG5cbi8qKlxuICAqIExvYWRzIHRoZW1lXG4gICogQHB1YmxpY1xuICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZSBUaGUgbmFtZSBvZiB0aGUgdGhlbWVcbiAgKiBAcmV0dXJuIHtPYmplY3R9IGxvYWQgVGhlIHN0eWxlIHRvIHVzZVxuICAqL1xuZXhwb3J0cy5sb2FkVGhlbWUgPSAodGhlbWUpID0+IHtcbiAgbGV0IGRpckV4aXN0cyA9IG51bGxcbiAgbGV0IGxvYWQgPSBudWxsXG4gIHRyeSB7XG4gICAgZnMuc3RhdFN5bmMoJ3RoZW1lcycpXG4gICAgZGlyRXhpc3RzID0gdHJ1ZVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIGRpckV4aXN0cyA9IGZhbHNlXG4gIH1cbiAgZGlyRXhpc3RzID8gbG9hZCA9IG5vb24ubG9hZChgdGhlbWVzLyR7dGhlbWV9Lm5vb25gKSA6IGxvYWQgPSBub29uLmxvYWQoYCR7VERJUn0ke3RoZW1lfS5ub29uYClcbiAgcmV0dXJuIGxvYWRcbn1cblxuLyoqXG4gICogR2V0cyB0aGVtZXMgZm9yIGxpc3QgY29tbWFuZFxuICAqIEBwdWJsaWNcbiAgKiBAcmV0dXJuIHtBcnJheX0gTGlzdCBvZiB0aGVtZSBuYW1lc1xuICAqL1xuZXhwb3J0cy5nZXRUaGVtZXMgPSAoKSA9PiB7XG4gIGNvbnN0IGxpc3QgPSBbXVxuICBsZXQgZGlyRXhpc3RzID0gbnVsbFxuICBsZXQgZmlsZXMgPSBbXVxuICB0cnkge1xuICAgIGZzLnN0YXRTeW5jKCd0aGVtZXMnKVxuICAgIGRpckV4aXN0cyA9IHRydWVcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSBkaXJFeGlzdHMgPSBmYWxzZVxuICB9XG4gIGRpckV4aXN0cyA/IGZpbGVzID0gZ2xvYi5zeW5jKCd0aGVtZXMvKi5ub29uJykgOiBmaWxlcyA9IGdsb2Iuc3luYyhgJHtURElSfSoubm9vbmApXG4gIF8uZWFjaChmaWxlcywgKHBhdGgpID0+IHtcbiAgICBjb25zdCBuYW1lID0gcGF0aC5yZXBsYWNlKC9bYS16MC05XFwvX1xcLl0qdGhlbWVzXFwvLywgJycpLnJlcGxhY2UoL1xcLm5vb24vLCAnJylcbiAgICBsaXN0LnB1c2gobmFtZSlcbiAgfSlcbiAgcmV0dXJuIGxpc3Rcbn1cblxuLyoqXG4gICogUHJpbnRzIGxhYmVsLCBjb25uZWN0b3IsIGFuZCBjb250ZW50XG4gICogQHB1YmxpY1xuICAqIEBwYXJhbSB7T2JqZWN0fSB0aGVtZSBUaGUgc3R5bGUgdG8gdXNlXG4gICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAnZG93bicgb3IgJ3JpZ2h0J1xuICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSBsYWJlbCB0ZXh0XG4gICogQHBhcmFtIHtzdHJpbmd9IFtjb250ZW50XSBUaGUgdGV4dCB0aGUgbGFiZWwgcG9pbnRzIGF0XG4gICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3R5bGl6ZWQgc3RyaW5nIHRvIGxvZ1xuICAqL1xuZXhwb3J0cy5sYWJlbCA9ICh0aGVtZSwgZGlyZWN0aW9uLCB0ZXh0LCBjb250ZW50KSA9PiB7XG4gIGNvbnN0IHBzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5wcmVmaXguc3R5bGUpXG4gIGNvbnN0IHRzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS50ZXh0LnN0eWxlKVxuICBjb25zdCBzc3R5bGUgPSBfLmdldChjaGFsaywgdGhlbWUuc3VmZml4LnN0eWxlKVxuICBjb25zdCBjbnN0eWxlID0gXy5nZXQoY2hhbGssIHRoZW1lLmNvbm5lY3Rvci5zdHlsZSlcbiAgY29uc3QgY3RzdHlsZSA9IF8uZ2V0KGNoYWxrLCB0aGVtZS5jb250ZW50LnN0eWxlKVxuICBsZXQgbGFiZWwgPSBgJHtwc3R5bGUodGhlbWUucHJlZml4LnN0cil9JHt0c3R5bGUodGV4dCl9JHtzc3R5bGUodGhlbWUuc3VmZml4LnN0cil9YFxuICBpZiAoZGlyZWN0aW9uID09PSAncmlnaHQnKSB7XG4gICAgY29udGVudCAhPT0gbnVsbCAmJiBjb250ZW50ICE9PSB1bmRlZmluZWQgPyBsYWJlbCA9IGAke2xhYmVsfSR7Y25zdHlsZSh0aGVtZS5jb25uZWN0b3Iuc3RyKX0ke2N0c3R5bGUoY29udGVudCl9YCA6IGxhYmVsID0gYCR7bGFiZWx9YFxuICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgY29udGVudCAhPT0gbnVsbCAmJiBjb250ZW50ICE9PSB1bmRlZmluZWQgPyBsYWJlbCA9IGAke2xhYmVsfVxcbiR7Y25zdHlsZSh0aGVtZS5jb25uZWN0b3Iuc3RyKX0ke2N0c3R5bGUoY29udGVudCl9YCA6IGxhYmVsID0gYCR7bGFiZWx9YFxuICB9IGVsc2UgeyB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBsYWJlbCBkaXJlY3Rpb24sIHVzZSAnZG93bicgb3IgJ3JpZ2h0Jy5cIikgfVxuICBjb25zb2xlLmxvZyhsYWJlbClcbiAgcmV0dXJuIGxhYmVsXG59XG4iXX0=