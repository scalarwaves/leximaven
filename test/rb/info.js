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
const outfile = path.resolve('test/output/info.out')

describe('command: rbrain info', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using rbrain info', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js rbrain info -o ${process.cwd()}/test/output/info.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'word info',
        arpabet: 'Y UW0 B IH1 K W IH0 T IY0',
        ipa: 'juˈbɪkwɪti',
        syllables: '4',
        dict: true,
        trusted: true,
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/info.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s[\w\W]*Wrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
