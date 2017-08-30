## Contributing

As of right now, I am the only one contributing to this project. I welcome you to open issues and submit pull requests so that leximaven can be even better.

### Build process & Development Cycle

- Build is managed with npm scripts. [redrun](https://github.com/coderaiser/redrun) is my task runner. Here are the tasks:

- **bin** - transpiles src into bin
- **bump** - after release task, pushes version to repo and publishes npm package
- **lint** - fixes stylistic issues in src folder
- **release** - uses standard-version to update the CHANGELOG and modify the version in package.json
- **watch** - watches src directory for changes and automatically compiles to bin folder

### Changelog & Versioning

- leximaven uses the [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) format. [commitizen](http://commitizen.github.io/cz-cli/) automates this formatting.
- There is no development branch on top of master, so the workflow is clean and simple. [git town](http://www.git-town.com/) helps automate this workflow.
- [standard-version](https://github.com/conventional-changelog/standard-version) automates [semantic versioning](http://semver.org/spec/v2.0.0.html) and changelog generation.
- See the [CHANGELOG](https://github.com/drawnepicenter/leximaven/blob/master/CHANGELOG.md) for progress.

### Coding Style & Linting

This project adheres to [standard](https://github.com/feross/standard) formatting rules.

### Testing

I was using Mocha, Chai, and Sinon for testing. At the moment there are no tests.
