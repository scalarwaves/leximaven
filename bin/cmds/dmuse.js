'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'dmuse <command>';
exports.desc = 'Datamuse tasks';
exports.builder = function (yargs) {
  return yargs.commandDir('dmuse');
};
exports.handler = function (argv) {};