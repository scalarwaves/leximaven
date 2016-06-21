const Code = require('code')
const Lab = require('lab')
const child = require('child_process')
const lab = exports.lab = Lab.script()
const version = require('../package.json').version
const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after
const expect = Code.expect

describe('flag: --version', () => {
  it('prints the version number', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js --version`, (err, stdout) => {
      expect(stdout).to.contain(version)
      done(err)
    })
  })
})
