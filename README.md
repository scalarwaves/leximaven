# leximaven

[![Build Status](https://travis-ci.org/drawnepicenter/leximaven.svg?branch=master)](https://travis-ci.org/drawnepicenter/leximaven) [![Dependency Status](https://gemnasium.com/badges/github.com/drawnepicenter/leximaven.svg)](https://gemnasium.com/github.com/drawnepicenter/leximaven) [![Greenkeeper badge](https://badges.greenkeeper.io/drawnepicenter/leximaven.svg)](https://greenkeeper.io/) [![Coverage Status](https://coveralls.io/repos/github/drawnepicenter/leximaven/badge.svg?branch=master)](https://coveralls.io/github/drawnepicenter/leximaven?branch=master) [![Code Climate](https://codeclimate.com/github/drawnepicenter/leximaven/badges/gpa.svg)](https://codeclimate.com/github/drawnepicenter/leximaven) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![Git Town](https://img.shields.io/badge/workflow-git%20town-brightgreen.svg)](http://www.git-town.com/)

[![npm version](https://badge.fury.io/js/leximaven.svg)](https://badge.fury.io/js/leximaven) [![Downloads](https://img.shields.io/npm/dt/leximaven.svg)](https://www.npmjs.com/package/leximaven) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version) [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/mit-license.php) [![Semver 2.0.0](https://img.shields.io/badge/semver-2.0.0-ff69b4.svg)](http://semver.org/spec/v2.0.0.html) [![Join the chat at https://gitter.im/drawnepicenter/leximaven](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Powered by Acronym Server](https://img.shields.io/badge/powered%20by-acronym%20server-brightgreen.svg)](http://acronyms.silmaril.ie) [![Powered by Datamuse](https://img.shields.io/badge/powered%20by-datamuse-green.svg)](http://www.datamuse.com) [![Powered by Onelook](https://img.shields.io/badge/powered%20by-onelook-yellow.svg)](http://www.onelook.com) [![Powered by Rhymebrain](https://img.shields.io/badge/powered%20by-rhymebrain-orange.svg)](http://www.rhymebrain.com) [![Powered by Wordnik](https://img.shields.io/badge/powered%20by-wordnik-red.svg)](http://www.wordnik.com) [![Powered by Wordsmith](https://img.shields.io/badge/powered%20by-wordsmith-ff69b4.svg)](http://wordsmith.org/anagram/)

## Introduction

leximaven is a powerful tool for searching word-related APIs from the command line. It can fetch acronyms, anagrams, bi-gram phrases, definitions, etymologies, example uses, hyphenation, offensive word flags, portmanteaus, pronunciations (Arpabet & IPA), related words, rhymes, slang, syllable stress and count, and more. See the [wiki](https://github.com/drawnepicenter/leximaven/wiki) for more info.

## Platform

Looking for testers on OSX. Well tested on Linux. Will test on Windows.
Supported Node.js versions:

- 7.x
- 6.x
- 5.x
- 4.x - Works but it's really slow

## Installation

To initialize the config file and load themes, your NODE_PATH environment variable must point to the **lib/node_modules** directory of the Node.js installation. You can set this path automatically like this:

    export NP=$(which node)
    export BP=${NP%bin/node} #this replaces the string '/bin/node'
    export LP="${BP}lib/node_modules"
    export NODE_PATH="$LP"

Provided these lines are towards the end of the shell initialization file (at least after any NVM stuff) this should work for a system installation of Node.js and [nvm](https://github.com/creationix/nvm). 

-   Put your [Wordnik API key](http://developer.wordnik.com/) into an environment variable **WORDNIK**

Add all of this to .bashrc, .zshrc, etc. then:

    npm install -g leximaven
    leximaven config init

## Usage

leximaven has a built-in help system for CLI parameters and options. Access it with `leximaven -h|--help [command] [subcommand]`. There is also the [wiki](https://github.com/drawnepicenter/leximaven/wiki).

Here are some examples:

    // Get definitions for 'catharsis'
    leximaven wordnik define catharsis

    // Get antonyms for 'noise'
    leximaven wordnik relate --canon --type antonym noises

    // Pronounce 'quixotic'
    leximaven wordnik pronounce quixotic

    // Get etymology for 'special'
    leximaven wordnik origin special

    // Get words that sound like 'blue'
    leximaven datamuse get sl=blue

    // Get slang/colloquialisms for 'diesel'
    leximaven urban diesel

    // Get anagrams with at least 2 letters in each word and a maximum of 3 words
    // per anagram using short form flags and exporting to JSON
    leximaven anagram -n2 -w3 -o anagrams.json toomanysecrets

    // Get a wordmap for 'ubiquity'
    leximaven wordmap ubiquity

See the [tests](https://github.com/drawnepicenter/leximaven/blob/master/test/test.es6) for more.

## Resources

The following links can help you use leximaven or perform related tasks.

- [alex](https://github.com/wooorm/alex) Checks your writing for words or phrasings that might offend someone
- [proselint](https://github.com/amperser/proselint) checks your writing style and has plugins for multiple editors
- [retext](https://github.com/wooorm/retext) is a framework for natural language processing
- [write-good](https://github.com/btford/write-good) Naive linter for English prose for developers who can't write good and wanna learn to do other stuff good too
- ISO 639-1 [Language Codes](http://www.loc.gov/standards/iso639-2/php/English_list.php) for Rhymebrain functions
- [Arpabet](http://en.wikipedia.org/wiki/Arpabet) phoneme list and [IPA](http://en.wikipedia.org/wiki/Help:IPA_for_English) equivalents
- [Dewey Decimal Classes](http://en.wikipedia.org/wiki/List_of_Dewey_Decimal_classes) for acronyms
- Browse Datamuse's Onelook [dictionaries](http://www.onelook.com/?d=all_gen), use its [dictionary lookup](http://www.onelook.com/), [thesaurus/reverse lookup](http://www.onelook.com/thesaurus/), and [RhymeZone](http://www.rhymezone.com/)

## Contributing

See [CONTRIBUTING](https://github.com/drawnepicenter/leximaven/blob/master/CONTRIBUTING.md).

## Gratitude

Many thanks to all contributors to the libraries used in this project! And thanks to the creators and maintainers of the APIs that this tool consumes. Acronym Server, Datamuse, Onelook, Rhymebrain, Urban Dictionary, Wordnik, and Wordsmith are awesome!

## Extras

### Prose

For fun, read some of my [prose](https://github.com/drawnepicenter/prose#readme)...

### Take Command

See [take-command](https://github.com/drawnepicenter/take-command).
