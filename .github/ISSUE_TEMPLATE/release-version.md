---
name: Release version
about: Checklist for releasing new libraries
title: Release x.x.x
labels: release
assignees: ''

---

- [ ]  validate that every merged ticket was tested (nothing should be left QA column, exceptions - ticket marked as `not-blocking-release`)
- [ ]  for new minors/RC create maintenance branch e.g. `release/1.5.x`
- [ ]  announce new maintenance branch on tribe channel (only when new maintenance branch)
- [ ]  create release branch eg. `release/1.5.0` (from develop for next release, from maintenance branch for any other release)
- [ ]  build app on this branch using this script: [https://github.tools.sap/cx-commerce/spartacus-installation](https://github.tools.sap/cx-commerce/spartacus-installation)
- [ ]  run all e2e tests on release branch (tip: run mobile, regression, smoke scripts in parallel to get all the results faster, after that retry failed tests in open mode)
- [ ]  make sure that release branch is working correctly, everything is passing and it builds (click few pages manually and look into build errors)

---

For Mac:
- [ ]  cleanup repo, build and generate compodocs and publish on github pages, generate spartacussampleaddon archives (`./scripts/pre-release.sh`)

For Windows:
- [ ]  cleanup repo, build and generate compodocs and publish on github pages (`./scripts/pre-release.sh` - without sampleaddon zip)
- [ ]  download and rename in root directory `https://github.tools.sap/cx-commerce/spartacussampledataaddon/archive/develop.zip` -> `spartacussampleaddon.zip`
- [ ]  download and rename in root directory `https://github.tools.sap/cx-commerce/spartacussampledataaddon/archive/develop.tar.gz` -> `spartacussampleaddon.tar.gz`

---

- [ ]  release libraries with `release-it` scripts (eg. for core `npm run release:core:with-changelog`)
        - make sure to run it as an npm script (`yarn` has issues with npm login)
        - add GITHUB_TOKEN env variable (`export GITHUB_TOKEN=token`)
        - be logged in to npm
- [ ]  check if release notes are populated on github (polish them or ask someone to review and improve them)
- [ ]  check tags on npm (`next` should always point to the highest version, `latest` to highest stable version)
- [ ]  check if everything builds from npm packages (spartacus installation script)
- [ ]  merge release branch into develop branch (for next releases) or into maintenance branch (for any other release)
- [ ]  announce on tribe channel
- [ ]  create tickets to nonblocking release problems found during the release process


## Notes
- always release libraries with the same version number (schematics exception for now)
