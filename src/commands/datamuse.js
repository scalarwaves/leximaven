/* eslint no-unused-vars: 0 */
exports.command = 'datamuse <command>'
exports.aliases = ['dmuse', 'dm']
exports.desc = 'Datamuse tasks'
exports.builder = (yargs) => yargs.commandDir('datamuse')
exports.handler = (argv) => {}
