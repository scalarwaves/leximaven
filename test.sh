#!/usr/bin/env bash

# Get definitions for 'catharsis'
node bin/leximaven.js leximaven wordnik define catharsis
#Get antonyms for 'noise'
node bin/leximaven.js leximaven wordnik relate --canon --type antonym noises
# Pronounce 'quixotic'
node bin/leximaven.js leximaven wordnik pronounce quixotic
# Get etymology for 'special'
node bin/leximaven.js leximaven wordnik origin special
# Get words that sound like 'blue'
node bin/leximaven.js leximaven datamuse get sl=blue
# Get slang/colloquialisms for 'diesel'
node bin/leximaven.js leximaven urban diesel
# Get a wordmap for 'ubiquity'
node bin/leximaven.js leximaven wordmap ubiquity
