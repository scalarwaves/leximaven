/* eslint no-unused-vars: 0 */
exports.command = 'rbrain <command>'
exports.desc = 'Rhymebrain operations'
exports.builder = (yargs) => yargs.commandDir('rhymebrain_cmds')
exports.handler = (argv) => {}
