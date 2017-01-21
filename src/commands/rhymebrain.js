/* eslint no-unused-vars: 0 */
exports.command = 'rhymebrain <command>'
exports.aliases = ['rbrain', 'rb']
exports.desc = 'Rhymebrain operations'
exports.builder = (yargs) => yargs.commandDir('rhymebrain')
exports.handler = (argv) => {}
