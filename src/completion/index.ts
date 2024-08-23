import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import readTsconfigPaths from '../read-tsconfig-paths'
import { getDirItems } from './utils'

function getPathsItems(
  baseDir: string,
  pathStr: string,
  pathDestination: string[]
) {
  console.log('! WORKING WITH TSCONFIG...')

  const dirItems = pathDestination.map((dirItem) => {
    const targetDest = dirItem.replace(/\*$/, '')
    const dirItemPath = path.resolve(baseDir, targetDest, pathStr)

    console.log({ dirItemPath, pathStr })

    return getDirItems(dirItemPath)
  })

  console.log({ dirItems })
  return dirItems.flat()
}

export default function (
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.CompletionItem[] {
  console.clear()
  const tsconfigPaths = readTsconfigPaths()
  const documentPath = document.uri.fsPath

  const lineText = document
    .lineAt(position.line)
    .text.slice(0, position.character)
  const [pathText] = /(?<=[\'\"`\s])[^\'\"`\s]+$/.exec(lineText)

  for (const key in tsconfigPaths) {
    if (!key.endsWith('*')) continue

    if (pathText.startsWith(key.slice(0, -1))) {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)

      console.log(workspaceFolder)

      return getPathsItems(
        workspaceFolder.uri.fsPath,
        pathText.slice(key.length - 1),
        tsconfigPaths[key]
      )
    }
  }

  if (pathText.startsWith('.')) {
    const cwd = path.dirname(documentPath)
    const targetDir = path.join(cwd, pathText)
    return getDirItems(targetDir)
  }

  return []
}
