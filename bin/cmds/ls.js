'use strict';

/* eslint no-unused-vars: 0 */
var themes = require('../themes');

var _ = require('lodash');

var sample = 'Morbi ornare pulvinar metus, non faucibus arcu ultricies non.';

exports.command = 'ls';
exports.desc = 'Get a list of installed themes';
exports.builder = {};
exports.handler = function (argv) {
  var list = themes.getThemes();
  _.each(list, function (value) {
    var name = value;
    var currentTheme = themes.loadTheme(name);
    themes.label(currentTheme, 'down', name, sample);
  });
};