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
const outfile = path.resolve('test/output/urban.out')

describe('command: urban', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using urban', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js urban -o ${process.cwd()}/test/output/urban.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'urban',
        definition0: 'Omnipresent; An existence or perceived existence of being everywhere at once.',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/urban.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w* \w*\]\s\[\w*\]\s[a-z;\s]*\.\sWrote data to [\w\/]*\.\w*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
