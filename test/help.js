/* eslint max-len: 0 */
const Code = require('code')
const Lab = require('lab')
const child = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after
const expect = Code.expect
const outfile = path.resolve('test/output/flags-help.out')

describe('flag: --help', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows help using --help', (done) => {
    child.exec(`node ${__dirname}/../build/leximaven.js --help > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/ __[ _\s\/\-\)\\'`\|,]*Usage:\s[a-z\/\.]* <[a-z]*> \[[a-z]*\]\s*Commands:\s*[a-z <>\s]*:\s*[a-z\-, \[\]\s]*/mig)
      done(err)
    })
  })
})
