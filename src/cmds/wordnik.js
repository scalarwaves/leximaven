/* eslint no-unused-vars: 0 */
exports.command = 'wordnik <command>'
exports.desc = 'Wordnik tasks'
exports.builder = (yargs) => yargs.commandDir('wordnik_cmds')
exports.handler = (argv) => {}
