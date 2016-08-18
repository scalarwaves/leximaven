'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'wordnik <command>';
exports.desc = 'Wordnik tasks';
exports.builder = function (yargs) {
  return yargs.commandDir('wordnik_cmds');
};
exports.handler = function (argv) {};