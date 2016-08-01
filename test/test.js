'use strict';

/* eslint max-len: 0 */
var CFILE = process.env.HOME + '/.leximaven.noon';
var TFILE = process.cwd() + '/test/test.config.noon';
var child = require('child_process');
var expect = require('chai').expect;
var fs = require('fs-extra');
var noon = require('noon');
var version = require('../package.json').version;

describe('command', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
      noon.save(CFILE, obj);
    } else {
      noon.save(CFILE, obj);
    }
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('acronym', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js acronym -o ' + process.cwd() + '/test/output/acronym.json DDC > test/output/acronym.out', function (err) {
        var stdout = fs.readFileSync('test/output/acronym.out', 'utf8');
        var json = fs.readJsonSync(process.cwd() + '/test/output/acronym.json');
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Found \d* acronyms for [a-z]*:\s[a-z0-9\s-:\/\.|(|)]*Wrote data to [a-z\/]*.json./mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('anagram', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js anagram -o ' + process.cwd() + '/test/output/anagram.json ubiquity > test/output/anagram.out', function (err) {
        var stdout = fs.readFileSync('test/output/anagram.out', 'utf8');
        var json = fs.readJsonSync(process.cwd() + '/test/output/anagram.json');
        var obj = {
          type: 'anagram',
          source: 'http://wordsmith.org/',
          url: 'http://wordsmith.org/anagram/anagram.cgi?anagram=ubiquity&language=english&t=10&d=10&include=&exclude=&n=1&m=50&a=n&l=n&q=n&k=1&src=adv',
          found: '2',
          show: 'all',
          alist: ['Ubiquity', 'Buy I Quit']
        };
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[Anagrams\]\sAnagrams for: [a-z]*\s\d* found. Displaying all:\s[a-z\/\.\s]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('comp', function () {
    it('outputs shell completion script', function (done) {
      child.exec('node ' + __dirname + '/../build/leximaven.js comp > test/output/comp.out', function (err) {
        var stdout = fs.readFileSync('test/output/comp.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[#\-a-z0-9\.\s:\/>~_\(\)\{\}\[\]="$@,;]*/mig);
        done(err);
      });
    });
  });
  describe('help', function () {
    it('shows usage', function (done) {
      child.exec('node ' + __dirname + '/../build/leximaven.js --help > test/output/help.out', function (err) {
        var stdout = fs.readFileSync('test/output/help.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[_ \/\(\)\-\\'`|,\s]*\s*Usage:\s[a-z \/\.<>\[\]]*\s*Commands:\s[ a-z<>\s]*:\s[ \-a-z,\[\]\s]*\[boolean\]\s*/mig);
        done(err);
      });
    });
  });
  describe('ls', function () {
    it('demonstrates installed themes', function (done) {
      child.exec('node ' + __dirname + '/../build/leximaven.js ls > test/output/ls.out', function (err) {
        var stdout = fs.readFileSync('test/output/ls.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z :|,.<>\-\[\]→]*/mig);
        done(err);
      });
    });
  });
  describe('map', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js map ubiquity > test/output/map.out', function (err) {
        var stdout = fs.readFileSync('test/output/map.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\],→ ;:'\?"\(\)-…\/\.√©ĭēˈɪ”]*/mig);
        done(err);
      });
    });
  });
  describe('onelook', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js onelook -o ' + process.cwd() + '/test/output/onelook.json ubiquity > test/output/onelook.out', function (err) {
        var stdout = fs.readFileSync('test/output/onelook.out', 'utf8');
        var obj = {
          type: 'onelook',
          source: 'http://www.onelook.com',
          url: 'http://onelook.com/?xml=1&w=ubiquity',
          definition: 'noun: the state of being everywhere at once (or seeming to be everywhere at once)',
          phrase: 'ubiquity records',
          sim: 'omnipresence,ubiquitousness'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/onelook.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]:\(\)→ \/\.,]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('urban', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js urban -o ' + process.cwd() + '/test/output/urban.json ubiquity > test/output/urban.out', function (err) {
        var stdout = fs.readFileSync('test/output/urban.out', 'utf8');
        var obj = {
          type: 'urban',
          source: 'http://www.urbandictionary.com',
          url: 'http://api.urbandictionary.com/v0/define?term=ubiquity',
          definition0: 'Omnipresent; An existence or perceived existence of being everywhere at once.'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/urban.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Definition\]\s[a-z→; \.]*\sWrote data to [a-z\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('version', function () {
    it('prints the version number', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js --version', function (err, stdout) {
        expect(stdout).to.contain(version);
        done(err);
      });
    });
  });
});

describe('dmuse command', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('get', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js dmuse get -o ' + process.cwd() + '/test/output/dmuse.json ml=ubiquity > test/output/dmuse-get.out', function (err) {
        var stdout = fs.readFileSync('test/output/dmuse-get.out', 'utf8');
        var obj = {
          type: 'datamuse',
          source: 'http://datamuse.com/api',
          url: 'http://api.datamuse.com/words?max=5&&ml=ubiquity&dmuse&get',
          match0: 'ubiquitousness',
          tags1: 'noun',
          match1: 'omnipresence',
          match2: 'pervasiveness',
          tags0: 'noun',
          match3: 'prevalence'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/dmuse.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→\s,]*\/dmuse.json./mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('info', function () {
    it('shows metrics', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js dmuse info > test/output/dmuse-info.out', function (err) {
        var stdout = fs.readFileSync('test/output/dmuse-info.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\/ ,\.]*\s[\w ]*\(v\d\): \d*.\d*\s[\w \(\/\):\.,%]*\s[\w \(\/\):\.,%]*/);
        done(err);
      });
    });
  });
});

describe('config command', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    fs.copySync(CFILE, 'test/output/saved.config.noon');
    done();
  });
  after(function (done) {
    fs.copySync('test/output/saved.config.noon', CFILE);
    fs.removeSync('test/output');
    done();
  });
  describe('get', function () {
    it('shows value of option verbose', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js config get verbose > test/output/config-get.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-get.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Option verbose is (true|false)\./mig);
        done(err);
      });
    });
  });
  describe('init', function () {
    before(function (done) {
      fs.removeSync(CFILE);
      done();
    });
    it('creates the config file', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js config init > test/output/config-init.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-init.out', 'utf8');
        var config = noon.load(CFILE);
        var obj = {
          anagram: {
            case: 1,
            lang: 'english',
            limit: 10,
            linenum: false,
            list: false,
            maxletter: 50,
            maxword: 10,
            minletter: 1,
            repeat: false
          },
          dmuse: {
            date: {
              interval: 'day',
              limit: 100000,
              remain: 100000,
              stamp: ''
            },
            max: 5
          },
          merge: true,
          onelook: {
            date: {
              interval: 'day',
              limit: 10000,
              remain: 10000,
              stamp: ''
            },
            links: false
          },
          rbrain: {
            combine: {
              lang: 'en',
              max: 5
            },
            date: {
              interval: 'hour',
              limit: 350,
              remain: 350,
              stamp: ''
            },
            info: {
              lang: 'en'
            },
            rhyme: {
              lang: 'en',
              max: 50
            }
          },
          theme: 'square',
          urban: {
            limit: 5
          },
          usage: true,
          verbose: false,
          wordmap: {
            limit: 1
          },
          wordnik: {
            date: {
              interval: 'hour',
              limit: 15000,
              remain: 15000,
              stamp: ''
            },
            define: {
              canon: false,
              defdict: 'all',
              limit: 5,
              part: ''
            },
            example: {
              canon: false,
              limit: 5,
              skip: 0
            },
            hyphen: {
              canon: false,
              dict: 'all',
              limit: 5
            },
            origin: {
              canon: false
            },
            phrase: {
              canon: false,
              limit: 5,
              weight: 13
            },
            pronounce: {
              canon: false,
              dict: '',
              limit: 5,
              type: ''
            },
            relate: {
              canon: false,
              limit: 10,
              type: ''
            }
          }
        };
        config.dmuse.date.stamp = '';
        config.dmuse.date.remain = 100000;
        config.onelook.date.stamp = '';
        config.onelook.date.remain = 10000;
        config.rbrain.date.stamp = '';
        config.rbrain.date.remain = 350;
        config.wordnik.date.stamp = '';
        config.wordnik.date.remain = 15000;
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Created [a-z\/\.]*/mig);
        expect(JSON.stringify(config, null, ' ')).to.equals(JSON.stringify(obj, null, ' '));
        done(err);
      });
    });
  });
  describe('set', function () {
    it('sets value of option verbose to true', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js config set verbose false > test/output/config-set.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-set.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Set option verbose to (true|false)\./mig);
        done(err);
      });
    });
  });
});

describe('rbrain command', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('combine', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js rbrain combine -m1 -o ' + process.cwd() + '/test/output/combine.json value > test/output/combine.out', function (err) {
        var stdout = fs.readFileSync('test/output/combine.out', 'utf8');
        var obj = {
          type: 'portmanteau',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getPortmanteaus&word=value&lang=en&maxResults=1&',
          set0: 'value,unique',
          portmanteau0: 'valunique'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/combine.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9,→ -\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('info', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js rbrain info -o ' + process.cwd() + '/test/output/info.json ubiquity > test/output/info.out', function (err) {
        var stdout = fs.readFileSync('test/output/info.out', 'utf8');
        var obj = {
          type: 'word info',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getWordInfo&word=ubiquity&lang=en',
          arpabet: 'Y UW0 B IH1 K W IH0 T IY0',
          ipa: 'juˈbɪkwɪti',
          syllables: '4',
          dict: true,
          trusted: true
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/info.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9 -→ˈɪ\/\.,]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('rhyme', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js rbrain rhyme -o ' + process.cwd() + '/test/output/rhyme.json ubiquity > test/output/rhyme.out', function (err) {
        var stdout = fs.readFileSync('test/output/rhyme.out', 'utf8');
        var obj = {
          type: 'rhyme',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getRhymes&word=ubiquity&lang=en&maxResults=5&',
          rhyme0: 'stability',
          rhyme1: 'typically',
          rhyme2: 'specifically',
          rhyme3: 'respectively',
          rhyme4: 'effectively'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/rhyme.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Rhymes\]→[a-z*, ]*\sWrote data to [a-z\/\.]*\s\d*\/\d*[a-z0-9 ,\.]*/mig);
        expect(JSON.stringify(json)).to.match(/[\{\}a-z0-9\s:\/\.",]*/mig);
        done(err);
      });
    });
  });
});

describe('wordnik command', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '');
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('define', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik define -l1 -o ' + process.cwd() + '/test/output/define.json ubiquity > test/output/define.out', function (err) {
        var stdout = fs.readFileSync('test/output/define.out', 'utf8');
        var obj = {
          type: 'definition',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/definitions?useCanonical=false&sourceDictionaries=all&includeRelated=false&includeTags=false&limit=1&partOfSpeech=&api_key=' + process.env.WORDNIK,
          text0: 'Existence or apparent existence everywhere at the same time; omnipresence: "the repetitiveness, the selfsameness, and the ubiquity of modern mass culture”  ( Theodor Adorno ). ',
          deftype0: 'noun',
          source0: 'ahd-legacy'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/define.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→ ;:",\-\(\)\.\/”]*Wrote data to [a-z\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('example', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik example -l1 -o ' + process.cwd() + '/test/output/example.json ubiquity > test/output/example.out', function (err) {
        var stdout = fs.readFileSync('test/output/example.out', 'utf8');
        var obj = {
          type: 'example',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/examples?useCanonical=false&includeDuplicates=false&limit=1&skip=0&api_key=' + process.env.WORDNIK,
          example0: 'Both are characterized by their ubiquity and their antiquity: No known human culture lacks them, and musical instruments are among the oldest human artifacts, dating to the Late Pleistocene about 50,000 years ago.'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/example.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\] →:,\.]*\sWrote data to [a-z\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('hyphen', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik hyphen -o ' + process.cwd() + '/test/output/hyphen.json ubiquity > test/output/hyphen.out', function (err) {
        var stdout = fs.readFileSync('test/output/hyphen.out', 'utf8');
        var obj = {
          type: 'hyphenation',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/hyphenation?useCanonical=false&limit=5&api_key=' + process.env.WORDNIK,
          syllable0: 'u',
          stress1: 'biq',
          syllable2: 'ui',
          syllable3: 'ty'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/hyphen.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Hyphenation\]u-biq-ui-ty\sWrote data to [a-z\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('origin', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik origin -o ' + process.cwd() + '/test/output/origin.json ubiquity > test/output/origin.out', function (err) {
        var stdout = fs.readFileSync('test/output/origin.out', 'utf8');
        var obj = {
          type: 'etymology',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/etymologies?useCanonical=false&api_key=' + process.env.WORDNIK,
          etymology: '[L.  everywhere, fr.  where, perhaps for ,  (cf.  anywhere), and if so akin to E. : cf. F. .]',
          origin: 'ubique, ubi, cubi, quobi, alicubi, who, ubiquit√©'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/origin.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\]→\.,\(\):√©]*Wrote data to [a-z\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('phrase', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik phrase -l1 -o ' + process.cwd() + '/test/output/phrase.json ubiquitous > test/output/phrase.out', function (err) {
        var stdout = fs.readFileSync('test/output/phrase.out', 'utf8');
        var obj = {
          type: 'phrase',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquitous/phrases?useCanonical=false&limit=1&wlmi=13&api_key=' + process.env.WORDNIK,
          agram0: 'ubiquitous',
          bgram0: 'amoeba'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/phrase.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]\-\s]*Wrote data to [a-z\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('pronounce', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik pronounce -o ' + process.cwd() + '/test/output/pronounce.json ubiquity > test/output/pronounce.out', function (err) {
        var stdout = fs.readFileSync('test/output/pronounce.out', 'utf8');
        var obj = {
          type: 'pronunciation',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/pronunciations?useCanonical=false&limit=5&api_key=' + process.env.WORDNIK,
          word: 'ubiquity',
          pronunciation0: '(yo͞o-bĭkˈwĭ-tē)',
          type0: 'ahd-legacy',
          pronunciation1: 'Y UW0 B IH1 K W IH0 T IY0',
          type1: 'arpabet'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/pronounce.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]\(\) \-→ĭēˈ\so͞]*\sWrote data to [a-z\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
  describe('relate', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik relate -l1 -o ' + process.cwd() + '/test/output/relate.json ubiquity > test/output/relate.out', function (err) {
        var stdout = fs.readFileSync('test/output/relate.out', 'utf8');
        var obj = {
          type: 'related words',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/relatedWords?useCanonical=false&limitPerRelationshipType=1&api_key=' + process.env.WORDNIK,
          word: 'ubiquity',
          type0: 'antonym',
          words0: 'uniquity',
          type1: 'hypernym',
          words1: 'presence',
          type2: 'cross-reference',
          words2: 'ubiquity of the king',
          type3: 'synonym',
          words3: 'omnipresence',
          type4: 'rhyme',
          words4: 'iniquity',
          type5: 'same-context',
          words5: 'omnipresence'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/relate.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\],\-→]*\sWrote data to [a-z\/\.]*/mig);
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj));
        done(err);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,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LENBQWY7QUFDQSxZQUFNLE1BQU07QUFDVixnQkFBTSxlQURJO0FBRVYsa0JBQVEsd0JBRkU7QUFHVix1SUFBMkgsUUFBUSxHQUFSLENBQVksT0FIN0g7QUFJVixnQkFBTSxVQUpJO0FBS1YsaUJBQU8sU0FMRztBQU1WLGtCQUFRLFVBTkU7QUFPVixpQkFBTyxVQVBHO0FBUVYsa0JBQVEsVUFSRTtBQVNWLGlCQUFPLGlCQVRHO0FBVVYsa0JBQVEsc0JBVkU7QUFXVixpQkFBTyxTQVhHO0FBWVYsa0JBQVEsY0FaRTtBQWFWLGlCQUFPLE9BYkc7QUFjVixrQkFBUSxVQWRFO0FBZVYsaUJBQU8sY0FmRztBQWdCVixrQkFBUTtBQWhCRSxTQUFaO0FBa0JBLFlBQU0sT0FBTyxHQUFHLFlBQUgsQ0FBbUIsUUFBUSxHQUFSLEVBQW5CLDhCQUFiO0FBQ0EsZUFBTyxPQUFPLE9BQVAsQ0FBZSxtQkFBZixFQUFvQyxJQUFwQyxDQUFQLEVBQWtELEVBQWxELENBQXFELEtBQXJELENBQTJELDhDQUEzRDtBQUNBLGVBQU8sS0FBSyxTQUFMLENBQWUsSUFBZixDQUFQLEVBQTZCLEVBQTdCLENBQWdDLE1BQWhDLENBQXVDLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBdkM7QUFDQSxhQUFLLEdBQUw7QUFDRCxPQXhCRDtBQXlCRCxLQTFCRDtBQTJCRCxHQTVCRDtBQTZCRCxDQWpNRCIsImZpbGUiOiJ0ZXN0LmVzNiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOiAwICovXG5jb25zdCBDRklMRSA9IGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5sZXhpbWF2ZW4ubm9vbmBcbmNvbnN0IFRGSUxFID0gYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC90ZXN0LmNvbmZpZy5ub29uYFxuY29uc3QgY2hpbGQgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJylcbmNvbnN0IGV4cGVjdCA9IHJlcXVpcmUoJ2NoYWknKS5leHBlY3RcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKVxuY29uc3Qgbm9vbiA9IHJlcXVpcmUoJ25vb24nKVxuY29uc3QgdmVyc2lvbiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuZGVzY3JpYmUoJ2NvbW1hbmQnLCAoKSA9PiB7XG4gIGJlZm9yZSgoZG9uZSkgPT4ge1xuICAgIGZzLm1rZGlycFN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICBjb25zdCBvYmogPSBub29uLmxvYWQoVEZJTEUpXG4gICAgb2JqLmRtdXNlLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgIG9iai5vbmVsb29rLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgIG9iai5yYnJhaW4uZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgb2JqLndvcmRuaWsuZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgbGV0IGZpbGVFeGlzdHMgPSBudWxsXG4gICAgdHJ5IHtcbiAgICAgIGZzLnN0YXRTeW5jKENGSUxFKVxuICAgICAgZmlsZUV4aXN0cyA9IHRydWVcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICBmaWxlRXhpc3RzID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZpbGVFeGlzdHMpIHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgICAgIG9iai5kbXVzZS5kYXRlLnN0YW1wID0gY29uZmlnLmRtdXNlLmRhdGUuc3RhbXBcbiAgICAgIG9iai5kbXVzZS5kYXRlLnJlbWFpbiA9IGNvbmZpZy5kbXVzZS5kYXRlLnJlbWFpblxuICAgICAgb2JqLm9uZWxvb2suZGF0ZS5zdGFtcCA9IGNvbmZpZy5vbmVsb29rLmRhdGUuc3RhbXBcbiAgICAgIG9iai5vbmVsb29rLmRhdGUucmVtYWluID0gY29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW5cbiAgICAgIG9iai5yYnJhaW4uZGF0ZS5zdGFtcCA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcFxuICAgICAgb2JqLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW5cbiAgICAgIG9iai53b3JkbmlrLmRhdGUuc3RhbXAgPSBjb25maWcud29yZG5pay5kYXRlLnN0YW1wXG4gICAgICBvYmoud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluXG4gICAgICBmcy5jb3B5U3luYyhDRklMRSwgJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJylcbiAgICAgIG5vb24uc2F2ZShDRklMRSwgb2JqKVxuICAgIH0gZWxzZSB7XG4gICAgICBub29uLnNhdmUoQ0ZJTEUsIG9iailcbiAgICB9XG4gICAgZG9uZSgpXG4gIH0pXG4gIGFmdGVyKChkb25lKSA9PiB7XG4gICAgbGV0IGZpbGVFeGlzdHMgPSBudWxsXG4gICAgdHJ5IHtcbiAgICAgIGZzLnN0YXRTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicpXG4gICAgICBmaWxlRXhpc3RzID0gdHJ1ZVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIGZpbGVFeGlzdHMgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZmlsZUV4aXN0cykge1xuICAgICAgZnMucmVtb3ZlU3luYyhDRklMRSlcbiAgICAgIGZzLmNvcHlTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicsIENGSUxFKVxuICAgIH0gZWxzZSB7XG4gICAgICBmcy5yZW1vdmVTeW5jKENGSUxFKVxuICAgIH1cbiAgICBmcy5yZW1vdmVTeW5jKCd0ZXN0L291dHB1dCcpXG4gICAgZG9uZSgpXG4gIH0pXG4gIGRlc2NyaWJlKCdhY3JvbnltJywgKCkgPT4ge1xuICAgIGl0KCdzaG93cyBvdXRwdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBhY3JvbnltIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvYWNyb255bS5qc29uIEREQyA+IHRlc3Qvb3V0cHV0L2Fjcm9ueW0ub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2Fjcm9ueW0ub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2Fjcm9ueW0uanNvbmApXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAnYWNyb255bScsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL2Fjcm9ueW1zLnNpbG1hcmlsLmllJyxcbiAgICAgICAgICB1cmw6ICdodHRwOi8vYWNyb255bXMuc2lsbWFyaWwuaWUvY2dpLWJpbi94YWE/RERDJyxcbiAgICAgICAgICBleHBhbnNpb24wOiAnRGV3ZXkgRGVjaW1hbCBDbGFzc2lmaWNhdGlvbicsXG4gICAgICAgICAgY29tbWVudDA6ICdsaWJyYXJ5IGFuZCBrbm93bGVkZ2UgY2xhc3NpZmljYXRpb24gc3lzdGVtJyxcbiAgICAgICAgICB1cmwwOiAnaHR0cDovL3d3dy5vY2xjLm9yZy9kZXdleS8nLFxuICAgICAgICAgIEREQzA6ICcwNDAnLFxuICAgICAgICAgIGV4cGFuc2lvbjE6ICdEaWdpdGFsIERhdGEgQ29udmVydGVyJyxcbiAgICAgICAgICBEREMxOiAnMDQwJyxcbiAgICAgICAgICBleHBhbnNpb24yOiAnRGlnaXRhbCBEb3duIENvbnZlcnRlcicsXG4gICAgICAgICAgRERDMjogJzAwMCcsXG4gICAgICAgICAgZXhwYW5zaW9uMzogJ0RpcmVjdCBEZXBhcnRtZW50IENhbGxpbmcnLFxuICAgICAgICAgIEREQzM6ICcwNDAnLFxuICAgICAgICAgIGV4cGFuc2lvbjQ6ICdEb2RnZSBDaXR5IE11bmljaXBhbCBhaXJwb3J0IChjb2RlKScsXG4gICAgICAgICAgY29tbWVudDQ6ICdVbml0ZWQgU3RhdGVzJyxcbiAgICAgICAgICBEREM0OiAnMzg3JyxcbiAgICAgICAgfVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9Gb3VuZCBcXGQqIGFjcm9ueW1zIGZvciBbYS16XSo6XFxzW2EtejAtOVxccy06XFwvXFwufCh8KV0qV3JvdGUgZGF0YSB0byBbYS16XFwvXSouanNvbi4vbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ2FuYWdyYW0nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIGFuYWdyYW0gLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9hbmFncmFtLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9hbmFncmFtLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9hbmFncmFtLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9hbmFncmFtLmpzb25gKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ2FuYWdyYW0nLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly93b3Jkc21pdGgub3JnLycsXG4gICAgICAgICAgdXJsOiAnaHR0cDovL3dvcmRzbWl0aC5vcmcvYW5hZ3JhbS9hbmFncmFtLmNnaT9hbmFncmFtPXViaXF1aXR5Jmxhbmd1YWdlPWVuZ2xpc2gmdD0xMCZkPTEwJmluY2x1ZGU9JmV4Y2x1ZGU9Jm49MSZtPTUwJmE9biZsPW4mcT1uJms9MSZzcmM9YWR2JyxcbiAgICAgICAgICBmb3VuZDogJzInLFxuICAgICAgICAgIHNob3c6ICdhbGwnLFxuICAgICAgICAgIGFsaXN0OiBbXG4gICAgICAgICAgICAnVWJpcXVpdHknLFxuICAgICAgICAgICAgJ0J1eSBJIFF1aXQnLFxuICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW0FuYWdyYW1zXFxdXFxzQW5hZ3JhbXMgZm9yOiBbYS16XSpcXHNcXGQqIGZvdW5kLiBEaXNwbGF5aW5nIGFsbDpcXHNbYS16XFwvXFwuXFxzXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ2NvbXAnLCAoKSA9PiB7XG4gICAgaXQoJ291dHB1dHMgc2hlbGwgY29tcGxldGlvbiBzY3JpcHQnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke19fZGlybmFtZX0vLi4vYnVpbGQvbGV4aW1hdmVuLmpzIGNvbXAgPiB0ZXN0L291dHB1dC9jb21wLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9jb21wLm91dCcsICd1dGY4JylcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvWyNcXC1hLXowLTlcXC5cXHM6XFwvPn5fXFwoXFwpXFx7XFx9XFxbXFxdPVwiJEAsO10qL21pZylcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdoZWxwJywgKCkgPT4ge1xuICAgIGl0KCdzaG93cyB1c2FnZScsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7X19kaXJuYW1lfS8uLi9idWlsZC9sZXhpbWF2ZW4uanMgLS1oZWxwID4gdGVzdC9vdXRwdXQvaGVscC5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvaGVscC5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1tfIFxcL1xcKFxcKVxcLVxcXFwnYHwsXFxzXSpcXHMqVXNhZ2U6XFxzW2EteiBcXC9cXC48PlxcW1xcXV0qXFxzKkNvbW1hbmRzOlxcc1sgYS16PD5cXHNdKjpcXHNbIFxcLWEteixcXFtcXF1cXHNdKlxcW2Jvb2xlYW5cXF1cXHMqL21pZylcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdscycsICgpID0+IHtcbiAgICBpdCgnZGVtb25zdHJhdGVzIGluc3RhbGxlZCB0aGVtZXMnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke19fZGlybmFtZX0vLi4vYnVpbGQvbGV4aW1hdmVuLmpzIGxzID4gdGVzdC9vdXRwdXQvbHMub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2xzLm91dCcsICd1dGY4JylcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW2EteiA6fCwuPD5cXC1cXFtcXF3ihpJdKi9taWcpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuICAgIGl0KCdzaG93cyBvdXRwdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBtYXAgdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9tYXAub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L21hcC5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXowLTlcXFtcXF0s4oaSIDs6J1xcP1wiXFwoXFwpLeKAplxcL1xcLuKImsKpxK3Ek8uIyarigJ1dKi9taWcpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnb25lbG9vaycsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgb25lbG9vayAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L29uZWxvb2suanNvbiB1YmlxdWl0eSA+IHRlc3Qvb3V0cHV0L29uZWxvb2sub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L29uZWxvb2sub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ29uZWxvb2snLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cub25lbG9vay5jb20nLFxuICAgICAgICAgIHVybDogJ2h0dHA6Ly9vbmVsb29rLmNvbS8/eG1sPTEmdz11YmlxdWl0eScsXG4gICAgICAgICAgZGVmaW5pdGlvbjogJ25vdW46IHRoZSBzdGF0ZSBvZiBiZWluZyBldmVyeXdoZXJlIGF0IG9uY2UgKG9yIHNlZW1pbmcgdG8gYmUgZXZlcnl3aGVyZSBhdCBvbmNlKScsXG4gICAgICAgICAgcGhyYXNlOiAndWJpcXVpdHkgcmVjb3JkcycsXG4gICAgICAgICAgc2ltOiAnb21uaXByZXNlbmNlLHViaXF1aXRvdXNuZXNzJyxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L29uZWxvb2suanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXowLTlcXFtcXF06XFwoXFwp4oaSIFxcL1xcLixdKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgndXJiYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHVyYmFuIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvdXJiYW4uanNvbiB1YmlxdWl0eSA+IHRlc3Qvb3V0cHV0L3VyYmFuLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC91cmJhbi5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAndXJiYW4nLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cudXJiYW5kaWN0aW9uYXJ5LmNvbScsXG4gICAgICAgICAgdXJsOiAnaHR0cDovL2FwaS51cmJhbmRpY3Rpb25hcnkuY29tL3YwL2RlZmluZT90ZXJtPXViaXF1aXR5JyxcbiAgICAgICAgICBkZWZpbml0aW9uMDogJ09tbmlwcmVzZW50OyBBbiBleGlzdGVuY2Ugb3IgcGVyY2VpdmVkIGV4aXN0ZW5jZSBvZiBiZWluZyBldmVyeXdoZXJlIGF0IG9uY2UuJyxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L3VyYmFuLmpzb25gKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9cXFtEZWZpbml0aW9uXFxdXFxzW2EteuKGkjsgXFwuXSpcXHNXcm90ZSBkYXRhIHRvIFthLXpcXC9cXC5dKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgndmVyc2lvbicsICgpID0+IHtcbiAgICBpdCgncHJpbnRzIHRoZSB2ZXJzaW9uIG51bWJlcicsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIC0tdmVyc2lvbmAsIChlcnIsIHN0ZG91dCkgPT4ge1xuICAgICAgICBleHBlY3Qoc3Rkb3V0KS50by5jb250YWluKHZlcnNpb24pXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcblxuZGVzY3JpYmUoJ2RtdXNlIGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgYmVmb3JlKChkb25lKSA9PiB7XG4gICAgICBmcy5ta2RpcnBTeW5jKCd0ZXN0L291dHB1dCcpXG4gICAgICBjb25zdCBvYmogPSBub29uLmxvYWQoVEZJTEUpXG4gICAgICBvYmouZG11c2UuZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgICBvYmoub25lbG9vay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIG9iai5yYnJhaW4uZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgICBvYmoud29yZG5pay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIGxldCBmaWxlRXhpc3RzID0gbnVsbFxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMuc3RhdFN5bmMoQ0ZJTEUpXG4gICAgICAgIGZpbGVFeGlzdHMgPSB0cnVlXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgZmlsZUV4aXN0cyA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmaWxlRXhpc3RzKSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgICAgICAgb2JqLmRtdXNlLmRhdGUuc3RhbXAgPSBjb25maWcuZG11c2UuZGF0ZS5zdGFtcFxuICAgICAgICBvYmouZG11c2UuZGF0ZS5yZW1haW4gPSBjb25maWcuZG11c2UuZGF0ZS5yZW1haW5cbiAgICAgICAgb2JqLm9uZWxvb2suZGF0ZS5zdGFtcCA9IGNvbmZpZy5vbmVsb29rLmRhdGUuc3RhbXBcbiAgICAgICAgb2JqLm9uZWxvb2suZGF0ZS5yZW1haW4gPSBjb25maWcub25lbG9vay5kYXRlLnJlbWFpblxuICAgICAgICBvYmoucmJyYWluLmRhdGUuc3RhbXAgPSBjb25maWcucmJyYWluLmRhdGUuc3RhbXBcbiAgICAgICAgb2JqLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW5cbiAgICAgICAgb2JqLndvcmRuaWsuZGF0ZS5zdGFtcCA9IGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXBcbiAgICAgICAgb2JqLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpblxuICAgICAgICBmcy5jb3B5U3luYyhDRklMRSwgJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJylcbiAgICAgIH1cbiAgICAgIG5vb24uc2F2ZShDRklMRSwgb2JqKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBhZnRlcigoZG9uZSkgPT4ge1xuICAgICAgbGV0IGZpbGVFeGlzdHMgPSBudWxsXG4gICAgICB0cnkge1xuICAgICAgICBmcy5zdGF0U3luYygndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nKVxuICAgICAgICBmaWxlRXhpc3RzID0gdHJ1ZVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICAgIGZpbGVFeGlzdHMgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZmlsZUV4aXN0cykge1xuICAgICAgICBmcy5yZW1vdmVTeW5jKENGSUxFKVxuICAgICAgICBmcy5jb3B5U3luYygndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nLCBDRklMRSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLnJlbW92ZVN5bmMoQ0ZJTEUpXG4gICAgICB9XG4gICAgICBmcy5yZW1vdmVTeW5jKCd0ZXN0L291dHB1dCcpXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGRlc2NyaWJlKCdnZXQnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBkbXVzZSBnZXQgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9kbXVzZS5qc29uIG1sPXViaXF1aXR5ID4gdGVzdC9vdXRwdXQvZG11c2UtZ2V0Lm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2RtdXNlLWdldC5vdXQnLCAndXRmOCcpXG4gICAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgICAgdHlwZTogJ2RhdGFtdXNlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly9kYXRhbXVzZS5jb20vYXBpJyxcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9hcGkuZGF0YW11c2UuY29tL3dvcmRzP21heD01JiZtbD11YmlxdWl0eSZkbXVzZSZnZXQnLFxuICAgICAgICAgICAgbWF0Y2gwOiAndWJpcXVpdG91c25lc3MnLFxuICAgICAgICAgICAgdGFnczE6ICdub3VuJyxcbiAgICAgICAgICAgIG1hdGNoMTogJ29tbmlwcmVzZW5jZScsXG4gICAgICAgICAgICBtYXRjaDI6ICdwZXJ2YXNpdmVuZXNzJyxcbiAgICAgICAgICAgIHRhZ3MwOiAnbm91bicsXG4gICAgICAgICAgICBtYXRjaDM6ICdwcmV2YWxlbmNlJyxcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9kbXVzZS5qc29uYClcbiAgICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9bYS16XFxbXFxd4oaSXFxzLF0qXFwvZG11c2UuanNvbi4vbWlnKVxuICAgICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgICAgZG9uZShlcnIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gICAgZGVzY3JpYmUoJ2luZm8nLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvd3MgbWV0cmljcycsIChkb25lKSA9PiB7XG4gICAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgZG11c2UgaW5mbyA+IHRlc3Qvb3V0cHV0L2RtdXNlLWluZm8ub3V0YCwgZXJyID0+IHtcbiAgICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2RtdXNlLWluZm8ub3V0JywgJ3V0ZjgnKVxuICAgICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXowLTlcXC8gLFxcLl0qXFxzW1xcdyBdKlxcKHZcXGRcXCk6IFxcZCouXFxkKlxcc1tcXHcgXFwoXFwvXFwpOlxcLiwlXSpcXHNbXFx3IFxcKFxcL1xcKTpcXC4sJV0qLylcbiAgICAgICAgICBkb25lKGVycilcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbn0pXG5cbmRlc2NyaWJlKCdjb25maWcgY29tbWFuZCcsICgpID0+IHtcbiAgYmVmb3JlKChkb25lKSA9PiB7XG4gICAgZnMubWtkaXJwU3luYygndGVzdC9vdXRwdXQnKVxuICAgIGZzLmNvcHlTeW5jKENGSUxFLCAndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nKVxuICAgIGRvbmUoKVxuICB9KVxuICBhZnRlcigoZG9uZSkgPT4ge1xuICAgIGZzLmNvcHlTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicsIENGSUxFKVxuICAgIGZzLnJlbW92ZVN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICBkb25lKClcbiAgfSlcbiAgZGVzY3JpYmUoJ2dldCcsICgpID0+IHtcbiAgICBpdCgnc2hvd3MgdmFsdWUgb2Ygb3B0aW9uIHZlcmJvc2UnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBjb25maWcgZ2V0IHZlcmJvc2UgPiB0ZXN0L291dHB1dC9jb25maWctZ2V0Lm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9jb25maWctZ2V0Lm91dCcsICd1dGY4JylcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvT3B0aW9uIHZlcmJvc2UgaXMgKHRydWV8ZmFsc2UpXFwuL21pZylcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdpbml0JywgKCkgPT4ge1xuICAgIGJlZm9yZSgoZG9uZSkgPT4ge1xuICAgICAgZnMucmVtb3ZlU3luYyhDRklMRSlcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gICAgaXQoJ2NyZWF0ZXMgdGhlIGNvbmZpZyBmaWxlJywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgY29uZmlnIGluaXQgPiB0ZXN0L291dHB1dC9jb25maWctaW5pdC5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvY29uZmlnLWluaXQub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICBhbmFncmFtOiB7XG4gICAgICAgICAgICBjYXNlOiAxLFxuICAgICAgICAgICAgbGFuZzogJ2VuZ2xpc2gnLFxuICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgbGluZW51bTogZmFsc2UsXG4gICAgICAgICAgICBsaXN0OiBmYWxzZSxcbiAgICAgICAgICAgIG1heGxldHRlcjogNTAsXG4gICAgICAgICAgICBtYXh3b3JkOiAxMCxcbiAgICAgICAgICAgIG1pbmxldHRlcjogMSxcbiAgICAgICAgICAgIHJlcGVhdDogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkbXVzZToge1xuICAgICAgICAgICAgZGF0ZToge1xuICAgICAgICAgICAgICBpbnRlcnZhbDogJ2RheScsXG4gICAgICAgICAgICAgIGxpbWl0OiAxMDAwMDAsXG4gICAgICAgICAgICAgIHJlbWFpbjogMTAwMDAwLFxuICAgICAgICAgICAgICBzdGFtcDogJycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWF4OiA1LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWVyZ2U6IHRydWUsXG4gICAgICAgICAgb25lbG9vazoge1xuICAgICAgICAgICAgZGF0ZToge1xuICAgICAgICAgICAgICBpbnRlcnZhbDogJ2RheScsXG4gICAgICAgICAgICAgIGxpbWl0OiAxMDAwMCxcbiAgICAgICAgICAgICAgcmVtYWluOiAxMDAwMCxcbiAgICAgICAgICAgICAgc3RhbXA6ICcnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxpbmtzOiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJicmFpbjoge1xuICAgICAgICAgICAgY29tYmluZToge1xuICAgICAgICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICAgICAgICBtYXg6IDUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0ZToge1xuICAgICAgICAgICAgICBpbnRlcnZhbDogJ2hvdXInLFxuICAgICAgICAgICAgICBsaW1pdDogMzUwLFxuICAgICAgICAgICAgICByZW1haW46IDM1MCxcbiAgICAgICAgICAgICAgc3RhbXA6ICcnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluZm86IHtcbiAgICAgICAgICAgICAgbGFuZzogJ2VuJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByaHltZToge1xuICAgICAgICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICAgICAgICBtYXg6IDUwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRoZW1lOiAnc3F1YXJlJyxcbiAgICAgICAgICB1cmJhbjoge1xuICAgICAgICAgICAgbGltaXQ6IDUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB1c2FnZTogdHJ1ZSxcbiAgICAgICAgICB2ZXJib3NlOiBmYWxzZSxcbiAgICAgICAgICB3b3JkbWFwOiB7XG4gICAgICAgICAgICBsaW1pdDogMSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHdvcmRuaWs6IHtcbiAgICAgICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgICAgaW50ZXJ2YWw6ICdob3VyJyxcbiAgICAgICAgICAgICAgbGltaXQ6IDE1MDAwLFxuICAgICAgICAgICAgICByZW1haW46IDE1MDAwLFxuICAgICAgICAgICAgICBzdGFtcDogJycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVmaW5lOiB7XG4gICAgICAgICAgICAgIGNhbm9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgZGVmZGljdDogJ2FsbCcsXG4gICAgICAgICAgICAgIGxpbWl0OiA1LFxuICAgICAgICAgICAgICBwYXJ0OiAnJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBleGFtcGxlOiB7XG4gICAgICAgICAgICAgIGNhbm9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgbGltaXQ6IDUsXG4gICAgICAgICAgICAgIHNraXA6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaHlwaGVuOiB7XG4gICAgICAgICAgICAgIGNhbm9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgZGljdDogJ2FsbCcsXG4gICAgICAgICAgICAgIGxpbWl0OiA1LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgICBjYW5vbjogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGhyYXNlOiB7XG4gICAgICAgICAgICAgIGNhbm9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgbGltaXQ6IDUsXG4gICAgICAgICAgICAgIHdlaWdodDogMTMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvbm91bmNlOiB7XG4gICAgICAgICAgICAgIGNhbm9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgZGljdDogJycsXG4gICAgICAgICAgICAgIGxpbWl0OiA1LFxuICAgICAgICAgICAgICB0eXBlOiAnJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWxhdGU6IHtcbiAgICAgICAgICAgICAgY2Fub246IGZhbHNlLFxuICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgIHR5cGU6ICcnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICAgIGNvbmZpZy5kbXVzZS5kYXRlLnN0YW1wID0gJydcbiAgICAgICAgY29uZmlnLmRtdXNlLmRhdGUucmVtYWluID0gMTAwMDAwXG4gICAgICAgIGNvbmZpZy5vbmVsb29rLmRhdGUuc3RhbXAgPSAnJ1xuICAgICAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IDEwMDAwXG4gICAgICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcCA9ICcnXG4gICAgICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSAzNTBcbiAgICAgICAgY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcCA9ICcnXG4gICAgICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gMTUwMDBcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvQ3JlYXRlZCBbYS16XFwvXFwuXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCAnICcpKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAnICcpKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2V0cyB2YWx1ZSBvZiBvcHRpb24gdmVyYm9zZSB0byB0cnVlJywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgY29uZmlnIHNldCB2ZXJib3NlIGZhbHNlID4gdGVzdC9vdXRwdXQvY29uZmlnLXNldC5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvY29uZmlnLXNldC5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1NldCBvcHRpb24gdmVyYm9zZSB0byAodHJ1ZXxmYWxzZSlcXC4vbWlnKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG5cbmRlc2NyaWJlKCdyYnJhaW4gY29tbWFuZCcsICgpID0+IHtcbiAgYmVmb3JlKChkb25lKSA9PiB7XG4gICAgZnMubWtkaXJwU3luYygndGVzdC9vdXRwdXQnKVxuICAgIGNvbnN0IG9iaiA9IG5vb24ubG9hZChURklMRSlcbiAgICBvYmouZG11c2UuZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgb2JqLm9uZWxvb2suZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgb2JqLnJicmFpbi5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICBvYmoud29yZG5pay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICBsZXQgZmlsZUV4aXN0cyA9IG51bGxcbiAgICB0cnkge1xuICAgICAgZnMuc3RhdFN5bmMoQ0ZJTEUpXG4gICAgICBmaWxlRXhpc3RzID0gdHJ1ZVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIGZpbGVFeGlzdHMgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZmlsZUV4aXN0cykge1xuICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgb2JqLmRtdXNlLmRhdGUuc3RhbXAgPSBjb25maWcuZG11c2UuZGF0ZS5zdGFtcFxuICAgICAgb2JqLmRtdXNlLmRhdGUucmVtYWluID0gY29uZmlnLmRtdXNlLmRhdGUucmVtYWluXG4gICAgICBvYmoub25lbG9vay5kYXRlLnN0YW1wID0gY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcFxuICAgICAgb2JqLm9uZWxvb2suZGF0ZS5yZW1haW4gPSBjb25maWcub25lbG9vay5kYXRlLnJlbWFpblxuICAgICAgb2JqLnJicmFpbi5kYXRlLnN0YW1wID0gY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wXG4gICAgICBvYmoucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpblxuICAgICAgb2JqLndvcmRuaWsuZGF0ZS5zdGFtcCA9IGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXBcbiAgICAgIG9iai53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW5cbiAgICAgIGZzLmNvcHlTeW5jKENGSUxFLCAndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nKVxuICAgIH1cbiAgICBub29uLnNhdmUoQ0ZJTEUsIG9iailcbiAgICBkb25lKClcbiAgfSlcbiAgYWZ0ZXIoKGRvbmUpID0+IHtcbiAgICBsZXQgZmlsZUV4aXN0cyA9IG51bGxcbiAgICB0cnkge1xuICAgICAgZnMuc3RhdFN5bmMoJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJylcbiAgICAgIGZpbGVFeGlzdHMgPSB0cnVlXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgZmlsZUV4aXN0cyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChmaWxlRXhpc3RzKSB7XG4gICAgICBmcy5yZW1vdmVTeW5jKENGSUxFKVxuICAgICAgZnMuY29weVN5bmMoJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJywgQ0ZJTEUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZzLnJlbW92ZVN5bmMoQ0ZJTEUpXG4gICAgfVxuICAgIGZzLnJlbW92ZVN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICBkb25lKClcbiAgfSlcbiAgZGVzY3JpYmUoJ2NvbWJpbmUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHJicmFpbiBjb21iaW5lIC1tMSAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2NvbWJpbmUuanNvbiB2YWx1ZSA+IHRlc3Qvb3V0cHV0L2NvbWJpbmUub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2NvbWJpbmUub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ3BvcnRtYW50ZWF1JyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vcmh5bWVicmFpbi5jb20nLFxuICAgICAgICAgIHVybDogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbS90YWxrP2Z1bmN0aW9uPWdldFBvcnRtYW50ZWF1cyZ3b3JkPXZhbHVlJmxhbmc9ZW4mbWF4UmVzdWx0cz0xJicsXG4gICAgICAgICAgc2V0MDogJ3ZhbHVlLHVuaXF1ZScsXG4gICAgICAgICAgcG9ydG1hbnRlYXUwOiAndmFsdW5pcXVlJyxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2NvbWJpbmUuanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1tcXFtcXF1hLXowLTks4oaSIC1cXC9cXC5dKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnaW5mbycsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgcmJyYWluIGluZm8gLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9pbmZvLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9pbmZvLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9pbmZvLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICd3b3JkIGluZm8nLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbScsXG4gICAgICAgICAgdXJsOiAnaHR0cDovL3JoeW1lYnJhaW4uY29tL3RhbGs/ZnVuY3Rpb249Z2V0V29yZEluZm8md29yZD11YmlxdWl0eSZsYW5nPWVuJyxcbiAgICAgICAgICBhcnBhYmV0OiAnWSBVVzAgQiBJSDEgSyBXIElIMCBUIElZMCcsXG4gICAgICAgICAgaXBhOiAnanXLiGLJqmt3yap0aScsXG4gICAgICAgICAgc3lsbGFibGVzOiAnNCcsXG4gICAgICAgICAgZGljdDogdHJ1ZSxcbiAgICAgICAgICB0cnVzdGVkOiB0cnVlLFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBmcy5yZWFkSnNvblN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvaW5mby5qc29uYClcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW1xcW1xcXWEtejAtOSAt4oaSy4jJqlxcL1xcLixdKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgncmh5bWUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHJicmFpbiByaHltZSAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L3JoeW1lLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9yaHltZS5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvcmh5bWUub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ3JoeW1lJyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vcmh5bWVicmFpbi5jb20nLFxuICAgICAgICAgIHVybDogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbS90YWxrP2Z1bmN0aW9uPWdldFJoeW1lcyZ3b3JkPXViaXF1aXR5Jmxhbmc9ZW4mbWF4UmVzdWx0cz01JicsXG4gICAgICAgICAgcmh5bWUwOiAnc3RhYmlsaXR5JyxcbiAgICAgICAgICByaHltZTE6ICd0eXBpY2FsbHknLFxuICAgICAgICAgIHJoeW1lMjogJ3NwZWNpZmljYWxseScsXG4gICAgICAgICAgcmh5bWUzOiAncmVzcGVjdGl2ZWx5JyxcbiAgICAgICAgICByaHltZTQ6ICdlZmZlY3RpdmVseScsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9yaHltZS5qc29uYClcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvXFxbUmh5bWVzXFxd4oaSW2EteiosIF0qXFxzV3JvdGUgZGF0YSB0byBbYS16XFwvXFwuXSpcXHNcXGQqXFwvXFxkKlthLXowLTkgLFxcLl0qL21pZylcbiAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGpzb24pKS50by5tYXRjaCgvW1xce1xcfWEtejAtOVxcczpcXC9cXC5cIixdKi9taWcpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcblxuZGVzY3JpYmUoJ3dvcmRuaWsgY29tbWFuZCcsICgpID0+IHtcbiAgYmVmb3JlKChkb25lKSA9PiB7XG4gICAgZnMubWtkaXJwU3luYygndGVzdC9vdXRwdXQnKVxuICAgIGNvbnN0IG9iaiA9IG5vb24ubG9hZChURklMRSlcbiAgICBvYmouZG11c2UuZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgb2JqLm9uZWxvb2suZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgb2JqLnJicmFpbi5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICBvYmoud29yZG5pay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICBsZXQgZmlsZUV4aXN0cyA9IG51bGxcbiAgICB0cnkge1xuICAgICAgZnMuc3RhdFN5bmMoQ0ZJTEUpXG4gICAgICBmaWxlRXhpc3RzID0gdHJ1ZVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIGZpbGVFeGlzdHMgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZmlsZUV4aXN0cykge1xuICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgb2JqLmRtdXNlLmRhdGUuc3RhbXAgPSBjb25maWcuZG11c2UuZGF0ZS5zdGFtcFxuICAgICAgb2JqLmRtdXNlLmRhdGUucmVtYWluID0gY29uZmlnLmRtdXNlLmRhdGUucmVtYWluXG4gICAgICBvYmoub25lbG9vay5kYXRlLnN0YW1wID0gY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcFxuICAgICAgb2JqLm9uZWxvb2suZGF0ZS5yZW1haW4gPSBjb25maWcub25lbG9vay5kYXRlLnJlbWFpblxuICAgICAgb2JqLnJicmFpbi5kYXRlLnN0YW1wID0gY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wXG4gICAgICBvYmoucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpblxuICAgICAgb2JqLndvcmRuaWsuZGF0ZS5zdGFtcCA9IGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXBcbiAgICAgIG9iai53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW5cbiAgICAgIGZzLmNvcHlTeW5jKENGSUxFLCAndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nKVxuICAgIH1cbiAgICBub29uLnNhdmUoQ0ZJTEUsIG9iailcbiAgICBkb25lKClcbiAgfSlcbiAgYWZ0ZXIoKGRvbmUpID0+IHtcbiAgICBsZXQgZmlsZUV4aXN0cyA9IG51bGxcbiAgICB0cnkge1xuICAgICAgZnMuc3RhdFN5bmMoJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJylcbiAgICAgIGZpbGVFeGlzdHMgPSB0cnVlXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgZmlsZUV4aXN0cyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChmaWxlRXhpc3RzKSB7XG4gICAgICBmcy5yZW1vdmVTeW5jKENGSUxFKVxuICAgICAgZnMuY29weVN5bmMoJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJywgQ0ZJTEUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZzLnJlbW92ZVN5bmMoQ0ZJTEUpXG4gICAgfVxuICAgIGZzLnJlbW92ZVN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICBkb25lKClcbiAgfSlcbiAgZGVzY3JpYmUoJ2RlZmluZScsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgd29yZG5payBkZWZpbmUgLWwxIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvZGVmaW5lLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9kZWZpbmUub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2RlZmluZS5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAnZGVmaW5pdGlvbicsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICAgICAgdXJsOiBgaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vdWJpcXVpdHkvZGVmaW5pdGlvbnM/dXNlQ2Fub25pY2FsPWZhbHNlJnNvdXJjZURpY3Rpb25hcmllcz1hbGwmaW5jbHVkZVJlbGF0ZWQ9ZmFsc2UmaW5jbHVkZVRhZ3M9ZmFsc2UmbGltaXQ9MSZwYXJ0T2ZTcGVlY2g9JmFwaV9rZXk9JHtwcm9jZXNzLmVudi5XT1JETklLfWAsXG4gICAgICAgICAgdGV4dDA6ICdFeGlzdGVuY2Ugb3IgYXBwYXJlbnQgZXhpc3RlbmNlIGV2ZXJ5d2hlcmUgYXQgdGhlIHNhbWUgdGltZTsgb21uaXByZXNlbmNlOiBcInRoZSByZXBldGl0aXZlbmVzcywgdGhlIHNlbGZzYW1lbmVzcywgYW5kIHRoZSB1YmlxdWl0eSBvZiBtb2Rlcm4gbWFzcyBjdWx0dXJl4oCdICAoIFRoZW9kb3IgQWRvcm5vICkuICcsXG4gICAgICAgICAgZGVmdHlwZTA6ICdub3VuJyxcbiAgICAgICAgICBzb3VyY2UwOiAnYWhkLWxlZ2FjeScsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9kZWZpbmUuanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXpcXFtcXF3ihpIgOzpcIixcXC1cXChcXClcXC5cXC/igJ1dKldyb3RlIGRhdGEgdG8gW2EtelxcL1xcLl0qL21pZylcbiAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGpzb24pKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdleGFtcGxlJywgKCkgPT4ge1xuICAgIGl0KCdzaG93cyBvdXRwdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyB3b3JkbmlrIGV4YW1wbGUgLWwxIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvZXhhbXBsZS5qc29uIHViaXF1aXR5ID4gdGVzdC9vdXRwdXQvZXhhbXBsZS5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvZXhhbXBsZS5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAnZXhhbXBsZScsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICAgICAgdXJsOiBgaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vdWJpcXVpdHkvZXhhbXBsZXM/dXNlQ2Fub25pY2FsPWZhbHNlJmluY2x1ZGVEdXBsaWNhdGVzPWZhbHNlJmxpbWl0PTEmc2tpcD0wJmFwaV9rZXk9JHtwcm9jZXNzLmVudi5XT1JETklLfWAsXG4gICAgICAgICAgZXhhbXBsZTA6ICdCb3RoIGFyZSBjaGFyYWN0ZXJpemVkIGJ5IHRoZWlyIHViaXF1aXR5IGFuZCB0aGVpciBhbnRpcXVpdHk6IE5vIGtub3duIGh1bWFuIGN1bHR1cmUgbGFja3MgdGhlbSwgYW5kIG11c2ljYWwgaW5zdHJ1bWVudHMgYXJlIGFtb25nIHRoZSBvbGRlc3QgaHVtYW4gYXJ0aWZhY3RzLCBkYXRpbmcgdG8gdGhlIExhdGUgUGxlaXN0b2NlbmUgYWJvdXQgNTAsMDAwIHllYXJzIGFnby4nLFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBmcy5yZWFkSnNvblN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvZXhhbXBsZS5qc29uYClcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW2EtejAtOVxcW1xcXSDihpI6LFxcLl0qXFxzV3JvdGUgZGF0YSB0byBbYS16XFwvXFwuXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ2h5cGhlbicsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgd29yZG5payBoeXBoZW4gLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9oeXBoZW4uanNvbiB1YmlxdWl0eSA+IHRlc3Qvb3V0cHV0L2h5cGhlbi5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvaHlwaGVuLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdoeXBoZW5hdGlvbicsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICAgICAgdXJsOiBgaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vdWJpcXVpdHkvaHlwaGVuYXRpb24/dXNlQ2Fub25pY2FsPWZhbHNlJmxpbWl0PTUmYXBpX2tleT0ke3Byb2Nlc3MuZW52LldPUkROSUt9YCxcbiAgICAgICAgICBzeWxsYWJsZTA6ICd1JyxcbiAgICAgICAgICBzdHJlc3MxOiAnYmlxJyxcbiAgICAgICAgICBzeWxsYWJsZTI6ICd1aScsXG4gICAgICAgICAgc3lsbGFibGUzOiAndHknLFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBmcy5yZWFkSnNvblN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvaHlwaGVuLmpzb25gKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9cXFtIeXBoZW5hdGlvblxcXXUtYmlxLXVpLXR5XFxzV3JvdGUgZGF0YSB0byBbYS16XFwvXFwuXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ29yaWdpbicsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgd29yZG5payBvcmlnaW4gLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9vcmlnaW4uanNvbiB1YmlxdWl0eSA+IHRlc3Qvb3V0cHV0L29yaWdpbi5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvb3JpZ2luLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdldHltb2xvZ3knLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cud29yZG5pay5jb20nLFxuICAgICAgICAgIHVybDogYGh0dHA6Ly9hcGkud29yZG5pay5jb206ODAvdjQvd29yZC5qc29uL3ViaXF1aXR5L2V0eW1vbG9naWVzP3VzZUNhbm9uaWNhbD1mYWxzZSZhcGlfa2V5PSR7cHJvY2Vzcy5lbnYuV09SRE5JS31gLFxuICAgICAgICAgIGV0eW1vbG9neTogJ1tMLiAgZXZlcnl3aGVyZSwgZnIuICB3aGVyZSwgcGVyaGFwcyBmb3IgLCAgKGNmLiAgYW55d2hlcmUpLCBhbmQgaWYgc28gYWtpbiB0byBFLiA6IGNmLiBGLiAuXScsXG4gICAgICAgICAgb3JpZ2luOiAndWJpcXVlLCB1YmksIGN1YmksIHF1b2JpLCBhbGljdWJpLCB3aG8sIHViaXF1aXTiiJrCqScsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9vcmlnaW4uanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXogXFxbXFxd4oaSXFwuLFxcKFxcKTriiJrCqV0qV3JvdGUgZGF0YSB0byBbYS16XFwvXFwuXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ3BocmFzZScsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgd29yZG5payBwaHJhc2UgLWwxIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvcGhyYXNlLmpzb24gdWJpcXVpdG91cyA+IHRlc3Qvb3V0cHV0L3BocmFzZS5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvcGhyYXNlLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdwaHJhc2UnLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cud29yZG5pay5jb20nLFxuICAgICAgICAgIHVybDogYGh0dHA6Ly9hcGkud29yZG5pay5jb206ODAvdjQvd29yZC5qc29uL3ViaXF1aXRvdXMvcGhyYXNlcz91c2VDYW5vbmljYWw9ZmFsc2UmbGltaXQ9MSZ3bG1pPTEzJmFwaV9rZXk9JHtwcm9jZXNzLmVudi5XT1JETklLfWAsXG4gICAgICAgICAgYWdyYW0wOiAndWJpcXVpdG91cycsXG4gICAgICAgICAgYmdyYW0wOiAnYW1vZWJhJyxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L3BocmFzZS5qc29uYClcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW2EtelxcW1xcXVxcLVxcc10qV3JvdGUgZGF0YSB0byBbYS16XFwvXFwuXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ3Byb25vdW5jZScsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgd29yZG5payBwcm9ub3VuY2UgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9wcm9ub3VuY2UuanNvbiB1YmlxdWl0eSA+IHRlc3Qvb3V0cHV0L3Byb25vdW5jZS5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvcHJvbm91bmNlLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdwcm9udW5jaWF0aW9uJyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgICAgICB1cmw6IGBodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi91YmlxdWl0eS9wcm9udW5jaWF0aW9ucz91c2VDYW5vbmljYWw9ZmFsc2UmbGltaXQ9NSZhcGlfa2V5PSR7cHJvY2Vzcy5lbnYuV09SRE5JS31gLFxuICAgICAgICAgIHdvcmQ6ICd1YmlxdWl0eScsXG4gICAgICAgICAgcHJvbnVuY2lhdGlvbjA6ICcoeW/Nnm8tYsSta8uId8StLXTEkyknLFxuICAgICAgICAgIHR5cGUwOiAnYWhkLWxlZ2FjeScsXG4gICAgICAgICAgcHJvbnVuY2lhdGlvbjE6ICdZIFVXMCBCIElIMSBLIFcgSUgwIFQgSVkwJyxcbiAgICAgICAgICB0eXBlMTogJ2FycGFiZXQnLFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBmcy5yZWFkSnNvblN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvcHJvbm91bmNlLmpzb25gKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9bYS16MC05XFxbXFxdXFwoXFwpIFxcLeKGksStxJPLiFxcc2/Nnl0qXFxzV3JvdGUgZGF0YSB0byBbYS16XFwvXFwuXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ3JlbGF0ZScsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgd29yZG5payByZWxhdGUgLWwxIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvcmVsYXRlLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9yZWxhdGUub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L3JlbGF0ZS5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAncmVsYXRlZCB3b3JkcycsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICAgICAgdXJsOiBgaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vdWJpcXVpdHkvcmVsYXRlZFdvcmRzP3VzZUNhbm9uaWNhbD1mYWxzZSZsaW1pdFBlclJlbGF0aW9uc2hpcFR5cGU9MSZhcGlfa2V5PSR7cHJvY2Vzcy5lbnYuV09SRE5JS31gLFxuICAgICAgICAgIHdvcmQ6ICd1YmlxdWl0eScsXG4gICAgICAgICAgdHlwZTA6ICdhbnRvbnltJyxcbiAgICAgICAgICB3b3JkczA6ICd1bmlxdWl0eScsXG4gICAgICAgICAgdHlwZTE6ICdoeXBlcm55bScsXG4gICAgICAgICAgd29yZHMxOiAncHJlc2VuY2UnLFxuICAgICAgICAgIHR5cGUyOiAnY3Jvc3MtcmVmZXJlbmNlJyxcbiAgICAgICAgICB3b3JkczI6ICd1YmlxdWl0eSBvZiB0aGUga2luZycsXG4gICAgICAgICAgdHlwZTM6ICdzeW5vbnltJyxcbiAgICAgICAgICB3b3JkczM6ICdvbW5pcHJlc2VuY2UnLFxuICAgICAgICAgIHR5cGU0OiAncmh5bWUnLFxuICAgICAgICAgIHdvcmRzNDogJ2luaXF1aXR5JyxcbiAgICAgICAgICB0eXBlNTogJ3NhbWUtY29udGV4dCcsXG4gICAgICAgICAgd29yZHM1OiAnb21uaXByZXNlbmNlJ1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBmcy5yZWFkSnNvblN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvcmVsYXRlLmpzb25gKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9bYS16IFxcW1xcXSxcXC3ihpJdKlxcc1dyb3RlIGRhdGEgdG8gW2EtelxcL1xcLl0qL21pZylcbiAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGpzb24pKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuIl19
