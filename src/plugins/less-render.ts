import * as path from 'path';
import * as less from 'less';
import { isNil } from '../utils';

export function replaceModulesPath(content: string, currentDir: string, projectRootDir: string): string {
  const importRE = /(@import\s*(\([^\)]+\)\s*)?(['"])(~))(?!\3)/gi;

  let match: RegExpMatchArray | null;

  while ((match = importRE.exec(content)) && !isNil(match)) {
    const currentStatement = match[0];
    const tilde = match[4];
    const pathToModules = path.join(path.relative(currentDir, projectRootDir), 'node_modules') + path.sep;

    const newStatement = currentStatement.replace(tilde, pathToModules);

    content = content.replace(currentStatement, newStatement);
  }

  return content;
}

export async function renderLess(content: string, currentDir: string, projectRootDir: string): Promise<string> {
  let result = '';

  try {
    const replacedPathsContent = replaceModulesPath(content, currentDir, projectRootDir);
    const lessResult = await less.render(replacedPathsContent, {
      relativeUrls: true,
      ieCompat: false,
    } as Less.Options);
    result = lessResult.css;
  } catch (err) {
    throw new Error(`Less compiler ${err.message}\n\nWhile compiling => "${content}`);
  }

  return result;
}
