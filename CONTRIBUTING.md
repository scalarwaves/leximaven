## Contributing

As of right now, I am the only one contributing to this project. I welcome you to open issues and submit pull requests so that Leximaven can be even better.

### Build process

- Managed with [Gulp](http://gulpjs.com) plugins.
- The **build** task transpiles all ES6 code to ES5 using [Babel](http://babeljs.io) and pipes to the build folder. Sourcemaps are inlined for code coverage.

### Changelog & Versioning

- Leximaven uses the [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) format. [commitizen](http://commitizen.github.io/cz-cli/) automates this formatting.
- There is no development branch on top of master, so the workflow is clean and simple. [git town](http://www.git-town.com/) helps automate this workflow.
- [standard-version](https://github.com/conventional-changelog/standard-version) automates [semantic versioning](http://semver.org/) and changelog generation.
- See the [CHANGELOG](https://github.com/drawnepicenter/leximaven/blob/master/CHANGELOG.md) for progress.

### Coding Style & Linting

Code is linted with [ESLint](http://eslint.org). If you want to contribute code please consider using the provided .eslintrc as a styleguide. It's based on [Airbnb's styleguide](https://github.com/airbnb/javascript), and customized to my liking.

### Testing

- Test runner - [Mocha](http://mochajs.org)
- Assertions - [Chai](http://chaijs.org)
