'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'config <command>';
exports.desc = 'Configuration tasks';
exports.builder = function (yargs) {
  return yargs.commandDir('config_cmds');
};
exports.handler = function (argv) {};