/* eslint no-unused-vars: 0 */
exports.command = 'dmuse <command>'
exports.desc = 'Datamuse tasks'
exports.builder = (yargs) => yargs.commandDir('dmuse_cmds')
exports.handler = (argv) => {}
