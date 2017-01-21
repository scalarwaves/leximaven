/* eslint no-unused-vars: 0 */
exports.command = 'wordnik <command>'
exports.aliases = ['wnik', 'wn']
exports.desc = 'Wordnik tasks'
exports.builder = (yargs) => yargs.commandDir('wordnik')
exports.handler = (argv) => {}
