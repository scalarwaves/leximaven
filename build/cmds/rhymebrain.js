'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'rbrain <command>';
exports.desc = 'Rhymebrain operations';
exports.builder = function (yargs) {
  return yargs.commandDir('rhymebrain_cmds');
};
exports.handler = function (argv) {};