import { experimental, JsonParseMode, parseJson } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { Schema as SpartacusOptions } from '../../add-spartacus/schema';

const DEFAULT_POSSIBLE_PROJECT_FILES = ['/angular.json', '/.angular.json'];

export function getSourceRoot(
  host: Tree,
  options: { project?: string | undefined; path?: string | undefined } = {}
): string {
  const workspace = getWorkspace(host).workspace;

  if (!options.project) {
    options.project = getDefaultProjectNameFromWorkspace(host);
  }

  const sourceRoot = workspace.projects[options.project].sourceRoot;
  if (!sourceRoot) {
    throw new SchematicsException('No default project found');
  }

  return sourceRoot;
}

export function getWorkspace(
  host: Tree,
  files = DEFAULT_POSSIBLE_PROJECT_FILES
): { path: string; workspace: experimental.workspace.WorkspaceSchema } {
  const angularJson = getAngularJsonFile(host, files);
  const path = files.filter((filePath) => host.exists(filePath))[0];

  return {
    path,
    workspace: angularJson,
  };
}

function getAngularJsonFile(
  tree: Tree,
  possibleProjectFiles = DEFAULT_POSSIBLE_PROJECT_FILES
): experimental.workspace.WorkspaceSchema {
  const path = possibleProjectFiles.filter((filePath) =>
    tree.exists(filePath)
  )[0];
  if (!path) {
    throw new SchematicsException(`Could not find Angular`);
  }

  const configBuffer = tree.read(path);
  if (configBuffer === null) {
    throw new SchematicsException(`Could not find (${path})`);
  }

  const angularJsonContent = configBuffer.toString();
  return (parseJson(
    angularJsonContent,
    JsonParseMode.Loose
  ) as unknown) as experimental.workspace.WorkspaceSchema;
}

export function getProjectFromWorkspace(
  tree: Tree,
  options: SpartacusOptions,
  files = DEFAULT_POSSIBLE_PROJECT_FILES
): experimental.workspace.WorkspaceProject {
  const { workspace } = getWorkspace(tree, files);

  if (!options.project) {
    throw new SchematicsException('Option "project" is required.');
  }

  const project = workspace.projects[options.project];
  if (!project) {
    throw new SchematicsException(`Project is not defined in this workspace.`);
  }

  if (project.projectType !== 'application') {
    throw new SchematicsException(
      `Spartacus requires a project type of "application".`
    );
  }

  return project;
}

export function getDefaultProjectNameFromWorkspace(tree: Tree): string {
  const workspace = getWorkspace(tree).workspace;

  return workspace.defaultProject !== undefined
    ? workspace.defaultProject
    : Object.keys(workspace.projects)[0];
}
