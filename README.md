## leximaven

Skip to [Introduction](#introduction)...

### Prose

```
April 20th, 1620 hours.
It was suck a budiful day I decided to take a walk iff the plarnk.
A flvagrant sat on a bench feeding pidgins and creoles.
Even though he looked a bit seedy, I tapped my hit to him and said,
"High how are you?"
He shrugged and said, "So-sober."
I looked down at his feathery friends.
"Ah, to bee a bird, I mean, to see a seed."
He squinted at me and said, "A seed easy?"
I replied, "No, 'eh bee seedy."
A young couple was approaching us. My companion owlgled the lady and said, "See that bird with the feather in her cap? She let me touch her titmouse." The young man turned cardinal red and said, "I should pfinch your face in!" The homeless man flipped him the bird and shouted, "You're too scared to try it, you yellow-bellied sapsucker!" As they hurried away, the young man muttered, "He's raven mad."
I dodon't know what to say. The indignent just sat there puffin on his halfpipe.
"What are you stoking there friend?"
"Crackpot."
"You can slow-cock a rooster hen one of those, just chickadee timer often."
"Yeah, but my brownies always come out hash-baked."
"Well, maybe you just need some potluck. Here's a five-leaf clover."
"What kind bud?"
"This strainge? Blueberrdy."
He took the nice nugget from me and said, "Dank." He rolled a joint and bluntly said, "I'll spliff this with you, fifty-fifty."
After hemping and hawking for a bit, I said, "Sure, what the flock." I sat on the bench and shared the marywanna sugarette with him.
After awhile he asked me, "How high are you?"
I just said, "Birds I view."
```

### Analysis

```
420, suck|such, bud|beautiful, walk in the park|walk off the plank
Flagrant|vagrant, pidgins|Pigeons, creoles|Orioles
So-so|sober
Down, feathery
A seed easy|AC/DC
'Eh bee seedy|ABCD
Owl|ogled, Titmouse, Cardinal, punch|Finch, Yellow-bellied sapsucker
Dodo|didn't, indignant|indigent, Puffin|puffing, half|hashpipe
Stoking|smoking, crack/pot|crockpot
Slow cook|cock roast|rooster in|hen, Chickadee|check the
Hash|half-baked
Potluck, pot leaf
Kind bud
Strain|strange, blueberry|Bluebird
Dank|Thanks
Joint, blunt, spliff|split
Hemp|hemming, Hawk|hawing, flock|fuck, mary wanna|marijuana sugar|cigarette
Hi how are you|How high are you
Bird's eye view|Birds I view
```

### Analysis of analysis

I started with `feeding pidgins and creoles`, and it just snowballed from there. It's packed with bird and stoner references. Imagine what Beethoven could have done with a MIDI keyboard and sequencing software. Now imagine what James Joyce could have written with a tool like this.

### Introduction

Leximaven is powerful. It can fetch acronyms, anagrams, bi-gram phrases, definitions, etymologies, example uses, hyphenation, offensive word flags, portmanteaus, pronunciations (ARPABET & IPA), related words, rhymes, slang, and syllable stress and count. See the [wiki](https://github.com/drawnepicenter/leximaven/wiki) for more info.

### Installation

[Get a Wordnik API key](http://developer.wordnik.com/) and put it in an environment variable WORDNIK. Add it to .bashrc, .zshrc, Windows env, etc.
Then run:

    npm install -g leximaven
    leximaven config init

### Usage

Leximaven has a built-in help system for CLI parameters and options. Access it with `leximaven -h|--help [command] [subcommand]`. There is also the [wiki](https://github.com/drawnepicenter/leximaven/wiki).

Here are some examples:

```
// Get antonyms for 'noise'
leximaven wordnik relate --canon --type antonym noises

// Get anagrams with at least 2 letters in each word and a maximum of 3 words per anagram using short form flags and exporting to JSON
leximaven anagram -n2 -w3 -o anagrams.json toomanysecrets

// Get a wordmap for 'ubiquity'
leximaven map ubiquity
```

### Resources

The following links can help you use Leximaven or perform related tasks.

- ISO 639-1 [Language Codes](http://www.loc.gov/standards/iso639-2/php/English_list.php) for Rhymebrain functions
- The [ARPABET](http://en.wikipedia.org/wiki/Arpabet) phoneme list and [IPA](http://en.wikipedia.org/wiki/Help:IPA_for_English) equivalents
- [Dewey Decimal Classes](http://en.wikipedia.org/wiki/List_of_Dewey_Decimal_classes) for acronyms
- Browse Datamuse's Onelook [dictionaries](http://www.onelook.com/?d=all_gen), use its [dictionary lookup](http://www.onelook.com/), [thesaurus/reverse lookup](http://www.onelook.com/thesaurus/), and [RhymeZone](http://www.rhymezone.com/)
- [proselint](https://github.com/amperser/proselint) checks your writing style and has plugins for multiple editors

### Contributing

See [CONTRIBUTING](https://github.com/drawnepicenter/leximaven/blob/master/CONTRIBUTING.md).

### Gratitude

Many thanks to all contributors to the libraries used in this project! And thanks to the creators and maintainers of the APIs that this tool consumes. Acronym Server, Datamuse, Onelook, Rhymebrain, Urban Dictionary, Wordnik, and Wordsmith are awesome!
