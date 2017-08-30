# leximaven

[![Build Status](https://travis-ci.org/drawnepicenter/leximaven.svg?branch=master)](https://travis-ci.org/drawnepicenter/leximaven) [![Dependency Status](https://gemnasium.com/badges/github.com/drawnepicenter/leximaven.svg)](https://gemnasium.com/github.com/drawnepicenter/leximaven) [![npm version](https://badge.fury.io/js/leximaven.svg)](https://badge.fury.io/js/leximaven) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Introduction

leximaven is a powerful tool for searching word-related APIs from the command line. It can fetch acronyms, anagrams, bi-gram phrases, definitions, etymologies, example uses, hyphenation, offensive word flags, portmanteaus, pronunciations (Arpabet & IPA), related words, rhymes, slang, syllable stress and count, and more. See the [wiki](https://github.com/drawnepicenter/leximaven/wiki) for more info.

## Platform

Looking for testers on OSX. Developed and tested on Linux. Works on Windows, see [Windows](#windows-installation) below.
Supported Node.js versions:

- 8.x
- 7.x
- 6.x

## Install

### Linux installation

To initialize the config file and load themes, your NODE_PATH environment variable must point to the **node_modules** directory of the Node.js installation. You can set this path automatically like this:

    export NP=$(which node)
    export BP=${NP%bin/node} #this replaces the string '/bin/node'
    export LP="${BP}lib/node_modules"
    export NODE_PATH="$LP"

Provided these lines are towards the end of the shell initialization file (at least after any NVM stuff) this should work for a system installation of Node.js and [nvm](https://github.com/creationix/nvm).

-   Put your [Wordnik API key](http://developer.wordnik.com/) into an environment variable **WORDNIK**

Add all of this to .bashrc, .zshrc, etc. then:

    npm install -g leximaven
    leximaven config init

### Windows installation

I highly recommend using [nodist](https://github.com/marcelklehr/nodist) to install Node.js on Windows. It automatically sets %NODE_PATH% for you, though you may have to edit it to make sure it doesn't contain itself (i.e. C:\...\...\node_modules;%NODE_PATH%). If you install Node.js manually, `npm install --global leximaven` will install the package in C:\Users\username\AppData\Roaming\npm\node_modules. And if you just do `npm install leximaven` then it will install the package to a subfolder of the Node.js installation, but that won't be the NODE_PATH folder unless you manually set it. Either way, you're going to have to mess around with Windows environment variables to get it to work. And don't forget to put your [Wordnik API key](http://developer.wordnik.com/) into an environment variable **WORDNIK**

As for getting the ANSI color escape codes to work, [Cmder](http://cmder.net/) seems to be the easiest way. It doesn't install a full linux environment like Cygwin, but you can still use some linux commands like **which**, **cat**, and **ls**.

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

## License

MIT :copyright: 2017 Andrew Prentice

## Powered by

Acronym Server, Datamuse, Onelook, Rhymebrain, Urban Dictionary, Wordnik, and Wordsmith

## Extras

### Prose

For fun, read some of my [prose](https://github.com/drawnepicenter/prose#readme)...

### Take Command

See [take-command](https://github.com/drawnepicenter/take-command).
