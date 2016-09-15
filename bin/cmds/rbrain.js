'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'rbrain <command>';
exports.desc = 'Rhymebrain operations';
exports.builder = function (yargs) {
  return yargs.commandDir('rbrain');
};
exports.handler = function (argv) {};