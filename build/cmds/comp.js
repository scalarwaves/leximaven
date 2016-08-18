'use strict';

var yargs = require('yargs');
exports.command = 'comp';
exports.desc = 'Print shell completion script';
exports.builder = {};
exports.handler = function (argv) {
  yargs.showCompletionScript().argv;
};