/* eslint no-unused-vars: 0 */
exports.command = 'configuration <command>'
exports.aliases = ['conf', 'config']
exports.desc = 'Configuration tasks'
exports.builder = (yargs) => yargs.commandDir('config')
exports.handler = (argv) => {}
