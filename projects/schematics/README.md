# Getting Started

Spartacus schematics allows you to install Spartacus libraries in your project

## Adding Spartacus libraries to your Angular project

Run the following command from your project root:

`ng add @spartacus/schematics`

### Available options

- `baseUrl`: Base url of your CX OCC backend
- `baseSite`: Name of your base site
- `occPrefix`: The OCC API prefix. E.g.: /occ/v2/
- `useMetaTags`: Whether or not to configure baseUrl and mediaUrl in the meta tags from `index.html`
- `featureLevel`: Application feature level. (default: _2.0_)
- `overwriteAppComponent`: Overwrite content of app.component.html file. (default: true)
- `pwa`: Include PWA features while constructing application.
- `ssr`: Include Server-side Rendering configuration.

### Other commands

By defaut `ng add @spartacus/schematics` will add only basic spartacus configuration. You are able extend application with features like *PWA* or *SSR* with commands listed below:

- `ng g @spartacus/schematics:add-pwa` - adds Spartacus-specific PWA module
- `ng g @spartacus/schematics:add-ssr` - adds server-side rendering configuration
- `ng g @spartacus/schematics:add-cms-component` - generates a cms component, and adds the CMS component mapping to the specified module (or generates a new module). For more see [CMS component schematic](#CMS-component-schematic)

## Steps performed by Spartacus schematics

1. Add required dependencies
2. Import Spartacus modules in app.module and setup default configuration
3. Import Spartacus styles to main.scss
4. Add `cx-storefront` component to your app.component
5. (Optionally) update index.html with Spartacus URL endpoints in meta tags
6. If `--pwa` flag included:
    - Add PWA/ServiceWorker support for your project
7. If `--ssr` flag included:
    - Add ssr dependencies
    - Provide additional files required for SSR

## CMS component schematic

### Available options for CMS component schematic

The following options are available:

- `--declareCmsModule` - specifies to which module to add the newly generated CMS component. If omitted, a new module is generated.
- `--cmsComponentData`, alias `--cms` - inject the _CmsComponentData_ in the new component. By default it is _true_
- `--cmsComponentDataModel`, alias `--cms-model` - Specify the model class for the _CmsComponentData_, e.g. _MyModel_. This argument is required if _--cmsComponentData_ is _true_.
- `--cmsComponentDataModelPath`, `--cms-model-path` - Specify the import path for the _CmsComponentData_. Default is _@spartacus/core_.

Besides the custom options, the `add-cms-component` supports almost all options that are available for the Angular's component and module schematics. The full list can be seen [here](https://github.com/SAP/cloud-commerce-spartacus-storefront/blob/develop/projects/schematics/src/add-cms-component/schema.json).

The following Angular's options are _not_ supported:

- deprecated options.
- _--module_ option for component - if you want to specify an existing module for the component, use _--declareCmsModule_. The _module_ option is only applied to the Angular's _module_ schematic.
- _--skipImport_ option.

### Examples

Here are some examples how the `add-cms-component` schematic can be used:

- `ng g @spartacus/schematics:add-cms-component myAwesomeCms --cms-model=MyModel` - generates _my-awesome-cms.component.ts_ component and _my-awesome-cms.module.ts_ module
- `ng g @spartacus/schematics:add-cms-component myAwesomeCms --cms-model=MyModel --declareCmsModule=my-cms-path/my-cms` - generates _my-awesome-cms.component.ts_ and adds it to the specified _my-cms-path/my-cms.module.ts._'s CMS mapping.
- `ng g @spartacus/schematics:add-cms-component myAwesomeCms --cms-model=MyModel --module=app` - generates _my-awesome-cms.component.ts_ component, _my-awesome-cms.module.ts_ module and imports it to the specified _app.module.ts_
- `ng g @spartacus/schematics:add-cms-component myAwesomeCms --cms-model=MyModel --module=app --declareCmsModule=my-cms-path/my-cms` - generates _my-awesome-cms.component.ts_ component and adds it to the specified _my-cms-path/my-cms.module.ts_ module. It also imports _my-cms.module.ts_ to the specified _app.module.ts_

## Building and using Spartacus Schematics from source

This section is for Spartacus developers and anybody else who works with Spartacus source code.

### Prerequisites

Install angular schematics globally: `npm install -g @angular-devkit/schematics-cli`

### Building and testing schematics

1. To build schematics use `yarn build`
2. To run tests use `yarn test`

### Running schematics on separate / new project

1. Run `npm pack` in schematics directory. It will generate the `spartacus-schematics-x.x.x.tgz` file.
2. Generate a new Angular app (using `ng new` command) or choose an existing one
3. Install and run schematics in your app using either:

- `ng add path-to-file/spartacus-schematics-x.x.x.tgz` (it will execute default schematics)
- `yarn add path-to-file/spartacus-schematics-x.x.x.tgz` and `ng g @spartacus/schematics:add-spartacus`

## Developing update schematics

### The update schematic structure

The `projects/schematics/src/migrations/migrations.json` file contains all migrations for all Spartacus versions:

- _name_ property is important for developers to quickly understand what the migration script is doing. By convention, the migration _name_ should follow `migration-v<version>-<migration-feature-name>-<sequence-number>` pattern, where:
  - _version_ should indicate for which Spartacus version the migration is intended.
  - _migration-feature-name_ is a short name that describes what the migration is doing.
  - _sequence-number_ is the sequence number in which the migrations should be executed
  - An example is _migration-v2-update-cms-component-state-02_.
- _version_ is _really_ important for the Angular's update mechanism, as it is used to automatically execute the required migration scripts for the current project's version. For more information about this, please check [releasing update schematics](#releasing-update-schematics) section.
- _factory_ - points to the specific migration script.
- _description_ - a short free-form description field for developers.

### Testing update schematic

The best way to test an unpublished update schematic is to publish it to a local npm registry.

To setup a local npm registry, we're going to use [verdaccio](https://github.com/verdaccio/verdaccio). To set it up, do the following:

- install it: `npm install --global verdaccio`
- run it in a new terminal tab / window: `verdaccio`
- create an npm user: `npm adduser --registry http://localhost:4873`. This is only needed when setting up _verdaccio_ for the first time.

In the project in which you are developing the update schematic:

- make sure that the major version number in `package.json` is _higher_ than it was. E.g. if developing an update schematic that's going to
update Spartacus from v2 to v3, then make sure that the version in `package.json` is set to `3.0.0`.
- also, make sure to bump the peer dependency version - e.g. in _storefrontlib_'s `package.json` bump the peer dependency for _core_.
- To publish the changes, navigate to the `projects/schematics` folder and run the following: `yarn build && npm publish --registry http://localhost:4873`

Now create a new angular project:

- `ng new spartacus-update-schematic-test` and `cd spartacus-update-schematic-test`
- add Spartacus by running e.g. `ng add @spartacus/schematics@1.5 --baseUrl https://storefront.c39j2-walkersde1-d4-public.model-t.cc.commerce.ondemand.com --baseSite electronics-spa`. Note that the version `1.5` is specified in `ng add @spartacus/schematics@1.5`.
- create `.npmrc` in the root of the project and paste the following content to it: `@spartacus:registry=http://localhost:4873` to point to the local npm server only for the `@spartacus` scope. From this moment on, `@spartacus` scoped packages will use the local npm registry.
- commit the changes, if any.
- run the following update command `ng update @spartacus/schematics`. If there's an error about the unresolved peer dependencies, you can append `--force` flag just to quickly test something out, but this error should _not_ appear when executing the update schematics without the flag. You should see your update commands executed now.

> NOTE: if _verdaccio_ refuses to publish libraries, and displays an error that says that the lib is already published with the same version, the quickest way around this seems to be [this](https://github.com/verdaccio/verdaccio/issues/1203#issuecomment-457361429) - 
> open `nano ~/.config/verdaccio/config.yaml` and under `packages: '@*/*':` sections, comment out the `proxy: npmjs` line. After doing this, you should be able to publish the packages.

### Iterative development

When doing iterative development of the update schematic, it's for the best to do the following before testing the changes:

- for the schematics library: unpublish the previous version and publish the new schematic code - `cd projects/schematics` and `yarn build && npm unpublish @spartacus/schematic --registry http://localhost:4873 --force && npm publish --registry http://localhost:4873`
- alternatively, you can run `./migrations-test.sh` (located in `scripts/migrations-test.sh`) script which will build all the relevant libs, unpublish the old versions and publish the new versions to the local npm registry. If you want to skip building of all the libs and just build and publish the `schematics` changes, you can run the script with `skip` argument: `migrations-test.sh skip`.
- in the test project:
  - revert the `package.json` and `yarn.lock` changes
  - make sure that the version of the `@spartacus/schematics` package is lower than the currently developed one. E.g. if you are developing an update schematic for v3, make sure that the version of `@spartacus/schematics` is set to i.e. `"^2.0.0"`. If any change is made, make sure to commit the changes.
  - delete the old `node_modules` folder and install the dependencies again: `rm -rf node_modules/ && yarn`
  - run the `ng update @spartacus/schematics --force` command

### How to write update schematics

#### Validations

If some validations are required to be ran before actually upgrading the Spartacus version, the "migration script" located in `projects/schematics/src/migrations/2_0/validate.ts` can be used.

#### Constructor deprecation

The `projects/schematics/src/migrations/2_0/constructor-deprecations.ts` performs the constructor migration tasks. Usually, a developer does not need to touch this file, but they should rather describe the constructor deprecation in `projects/schematics/src/migrations/2_0/constructor-deprecation-data.ts`. The constant `CONSTRUCTOR_DEPRECATION_DATA` describes the deprecated constructor and has `addParams` and `removeParams` properties in which you can specify which parameters should be added or removed, respectively.

#### Commenting code

Another common case is to place a comment in customer's code base, describing what should they do in order to upgrade to a new Spartacus version. We should do this only in cases where upgrading manually is easy, but writing a migration script would be too complex.
The `projects/schematics/src/shared/utils/file-utils.ts#insertCommentAboveIdentifier` method will add comment above the specified _identifier_ TypeScript node.

Some examples:

- adding a comment above the removed API method, guiding customers which method they can use instead.
- adding a comment above the Ngrx action in which we changed parameters

#### Component deprecation

Similar to [constructor deprecation](#Constructor-deprecation), `projects/schematics/src/migrations/2_0/component-deprecations.ts` performs the component migration tasks, for both component _*.ts_ and _HTML_ templates. Usually, a developer does not need to touch this file, and they should rather describe the component deprecation in `projects/schematics/src/migrations/2_0/component-deprecations-data.ts`. The constant `COMPONENT_DEPRECATION_DATA` describes the deprecated components.

#### CSS

To handle CSS changes, we are printing a link to the CSS docs, where customers can look up which CSS selectors have changed between Spartacus versions. For this reason, if making a change to a CSS selector, please update this docs. (link to follow).

### Releasing update schematics

This section is for developers who do the release, and it specifies how to manage the versions in `projects/schematics/src/migrations/migrations.json`.

The migration scripts that are listed here should be executed each time customers perform the automatic upgrade by running `ng update @spartacus/schematics --next`:

- `migration-v2-validate-01`
- `migration-v2-constructor-deprecations-03`
- `migration-v2-removed-public-api-04`
- `migration-v2-component-deprecations-05`
- `migration-v2-css-06`

Please bump the `version` in `migration.json` only for the migration scripts listed above, and _do not change the other script's versions_.

This is _really_ important for the Angular's update mechanism, as it is used to automatically execute the required migration scripts for the current project's version.
It's also important to note that after we release a Spartacus _next.x_, or an _rc.x_ version, all the migration scripts that are written after the release _have_ to specify the future release version.
E.g. if Spartacus _2.0.0-next.1_ has been released, then the _new_ migration scripts (added after it _2.0.0-next.1_) should specify the next version (e.g. _2.0.0-next.2_).
This is required for clients that upgrade frequently and it will make angular to run only the new migration scripts for them, avoiding the same scripts to run twice.
However, there are exceptions from this rule - as we have data-driven generic mechanisms for e.g. constructor deprecation, we have to bump the version in `migrations.json` for those scripts.
