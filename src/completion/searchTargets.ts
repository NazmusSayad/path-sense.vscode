import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

function getDirItems(dir: string) {
  if (!fs.existsSync(dir)) return []
  const items = fs.readdirSync(dir)

  return items.map((item) => {
    const itemPath = path.join(dir, item)
    const itemStat = fs.statSync(itemPath)

    const completionItem = new vscode.CompletionItem(item)
    completionItem.tags = [vscode.CompletionItemTag.Deprecated]

    if (itemStat.isFile()) {
      const parsedPath = path.parse(item)
      completionItem.sortText = '\u0001'
      completionItem.kind = vscode.CompletionItemKind.File
      if (parsedPath.ext === '.ts') {
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

export default function (...targets: string[]) {
  return targets.map(getDirItems).flat()
}
