'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'dmuse <command>';
exports.desc = 'Datamuse tasks';
exports.builder = function (yargs) {
  return yargs.commandDir('dmuse_cmds');
};
exports.handler = function (argv) {};