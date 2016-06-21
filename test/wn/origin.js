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
const outfile = path.resolve('test/output/origin.out')

describe('command: wordnik origin', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using wordnik origin', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js wordnik origin -o ${process.cwd()}/test/output/origin.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'etymology',
        etymology: '[L.  everywhere, fr.  where, perhaps for ,  (cf.  anywhere), and if so akin to E. : cf. F. .]',
        source: 'ubique, ubi, cubi, quobi, alicubi, who, ubiquit√©',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/origin.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s\[\w*\]\s[\w\W]*Wrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
