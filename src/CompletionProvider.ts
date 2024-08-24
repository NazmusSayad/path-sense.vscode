import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { TSConfigStore } from './TSConfigStore'

export class CompletionProvider {
  private documentPath
  private workspaceFolder

  constructor(
    private config: CompletionProviderConfig,
    private tsconfig: TSConfigStore.Config | null,
    private context: vscode.ExtensionContext,
    private compilationContext: vscode.CompletionContext,
    private document: vscode.TextDocument,
    private position: vscode.Position
  ) {
    this.documentPath = this.document.uri.fsPath
    this.workspaceFolder = path.resolve(
      this.tsconfig?.baseUrl ??
        vscode.workspace.getWorkspaceFolder(this.document.uri)?.uri.fsPath ??
        '.'
    )
  }

  private getItemsFromDir(dir: string) {
    if (!fs.existsSync(dir)) return []
    const items = fs.readdirSync(dir)

    return items.map((item) => {
      const itemPath = path.join(dir, item)
      const itemStat = fs.statSync(itemPath)

      const completionItem = new vscode.CompletionItem(item)
      completionItem.tags = [vscode.CompletionItemTag.Deprecated]
      completionItem.detail = path.relative(this.workspaceFolder, itemPath)

      if (itemStat.isFile()) {
        const parsedPath = path.parse(item)
        completionItem.sortText = '\u0001'
        completionItem.kind = vscode.CompletionItemKind.File
        if (this.config.removeExtensions.includes(parsedPath.ext)) {
          completionItem.insertText = parsedPath.name
        }
      } else {
        completionItem.sortText = '\u0000'
        completionItem.kind = vscode.CompletionItemKind.Folder
        completionItem.insertText = item + '/'
        completionItem.command = {
          title: 'TEST',
          command: 'editor.action.triggerSuggest',
        }
      }

      return completionItem
    })
  }

  private getItemsFromMultipleDirs(...dirs: string[]) {
    return dirs.map((d) => this.getItemsFromDir(d)).flat()
  }

  private getDestinationsFromTSConfig(inputStr: string) {
    const parsedTSPaths = this.parseTSConfigPaths()
    for (const pathAlias in parsedTSPaths) {
      if (inputStr.startsWith(pathAlias)) {
        const targetPaths = parsedTSPaths[pathAlias].map((targetPath) => {
          return path.resolve(targetPath, inputStr.slice(pathAlias.length))
        })

        return targetPaths
      }
    }
  }

  private getItemsFromMappings(inputStr: string) {
    const { mappings } = this.config
    const items: string[] = []

    for (const key in mappings) {
      if (inputStr.startsWith(key)) {
        items.push(
          path.join(
            mappings[key].replace(':', this.workspaceFolder),
            inputStr.slice(key.length)
          )
        )
      }
    }

    return items
  }

  private parseInputStr() {
    const lineText = this.document
      .lineAt(this.position.line)
      .text.slice(0, this.position.character)
    const [pathText] = /(?<=[\'\"`\s])[^\'\"`\s]+$/.exec(lineText) || []

    return pathText
  }

  private parseTSConfigPaths() {
    const { paths } = this.tsconfig ?? {}
    const newPaths: Record<string, string[]> = {}

    for (const key in paths) {
      if (!key.endsWith('*')) continue
      const exactPath = key.slice(0, -1)

      newPaths[exactPath] = paths[key]
        .filter((pathStr) => pathStr.endsWith('/'))
        .map((pathStr) =>
          path.resolve(this.workspaceFolder, pathStr.slice(0, -1))
        )
    }

    return newPaths
  }

  provideCompletionItems(): vscode.CompletionItem[] {
    console.clear()

    const inputStr = this.parseInputStr()
    if (!inputStr) return []
    const destinations: string[] = []

    if (inputStr.startsWith('.')) {
      const targetDir = path.join(path.dirname(this.documentPath), inputStr)
      destinations.push(targetDir)
    } else {
      const tsconfigDestinations = this.getDestinationsFromTSConfig(inputStr)
      if (tsconfigDestinations?.length)
        destinations.push(...tsconfigDestinations)

      const mappingDestinations = this.getItemsFromMappings(inputStr)
      if (mappingDestinations?.length) destinations.push(...mappingDestinations)
    }

    const uniqueDirs = [...new Set(destinations.map((d) => path.resolve(d)))]
    return this.getItemsFromMultipleDirs(...uniqueDirs)
  }
}

export type CompletionProviderConfig = {
  mappings: Record<string, string>
  removeExtensions: string[]
}
