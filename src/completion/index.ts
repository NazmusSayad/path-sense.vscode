import * as path from 'path'
import * as vscode from 'vscode'
import { readTSConfig } from '../tsconfig'
import searchTargets from './searchTargets'

function getPathsItems(
  baseDir: string,
  pathStr: string,
  pathDestination: string[]
) {
  console.log('! WORKING WITH TSCONFIG...')

  const targetPaths = pathDestination.map((dirItem) => {
    const targetDest = dirItem.replace(/\*$/, '')
    return path.resolve(baseDir, targetDest, pathStr)
  })

  return searchTargets(...targetPaths)
}

export default function (
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.CompletionItem[] {
  const documentPath = document.uri.fsPath
  const tsconfig = readTSConfig(documentPath)
  const workspaceFolder = tsconfig.baseUrl
    ? tsconfig.baseUrl
    : vscode.workspace.getWorkspaceFolder(document.uri).uri.fsPath

  const lineText = document
    .lineAt(position.line)
    .text.slice(0, position.character)
  const [pathText] = /(?<=[\'\"`\s])[^\'\"`\s]+$/.exec(lineText)

  
  if (!pathText) return []
  
  console.clear()
  console.log(':::', tsconfig.baseUrl, workspaceFolder)

  for (const key in tsconfig.paths || {}) {
    if (!key.endsWith('*')) continue

    if (pathText.startsWith(key.slice(0, -1))) {
      return getPathsItems(
        workspaceFolder,
        pathText.slice(key.length - 1),
        tsconfig.paths[key]
      )
    }
  }

  if (pathText.startsWith('/')) {
    const targetDir = path.join(workspaceFolder, pathText)
    return searchTargets(targetDir)
  }

  if (pathText.startsWith('.')) {
    const targetDir = path.join(path.dirname(documentPath), pathText)
    return searchTargets(targetDir)
  }

  return []
}
