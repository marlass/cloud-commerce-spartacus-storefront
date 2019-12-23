---
name: Release version
about: Checklist for releasing new libraries
title: Release x.x.x
labels: release
assignees: ''

---

- [ ]  for new minors/RC first we create maintenance branch `release/1.3.x`
- [ ]  announce new maintenance branch on tribe channel
- [ ]  then from maintenance branch we create particular release branch `release/1.3.0`
- [ ]  build app on this branch using this script: [https://github.tools.sap/cx-commerce/spartacus-installation](https://github.tools.sap/cx-commerce/spartacus-installation)
- [ ]  run all e2e tests on release branch
- [ ]  validate that every merged ticket is server QA (nothing should be left in those column, exceptions - ticket marked as not blocking)
- [ ]  we are sure that release branch is working correctly, everything is passing and it builds
- [ ]  generate compodocs `yarn generate:docs` check if new archives created
- [ ]  release libraries with `release-it` scripts
- [ ]  check if release-notes are populated on github (if not update)
- [ ]  check tags on npm
- [ ]  publish docs `publish:docs`
- [ ]  check if everything builds from npm packages (spartacus-installation) script
- [ ]  remove old tags on npm - `npm dist-tag`
- [ ]  merge release branch into maintenance branch (normal merge in console and push branch, no squash)
- [ ]  inform Bill about released libraries (for patch releases, you can announce on public slack)
- [ ]  always release everything with same version number (schematics exception for now)
- [ ]  announcing on tribe channel

Exceptions:

- [ ]  for next release we create release branch from `develop`
- [ ]  merge next release branches into develop (squash and merge)
- [ ]  schematics are right now not synced with other libs (different version)

To do:

- [ ]  npm accounts and spartacus org access
- [ ]  dry runs scripts, docs generation
- [ ]  test spartacus-installation scripts
- [ ]  knowledge about our git flow
