import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

export function getDirItems(dir: string) {
  if (!fs.existsSync(dir)) return []

  const items = fs.readdirSync(dir)

  return items.map((item) => {
    const itemPath = path.join(dir, item)
    const itemStat = fs.statSync(itemPath)
    const isItemFile = itemStat.isFile()

    const completionItem = new vscode.CompletionItem(
      item,
      isItemFile
        ? vscode.CompletionItemKind.File
        : vscode.CompletionItemKind.Folder
    )

    completionItem.insertText = isItemFile ? path.parse(item).name : item + '/'
    completionItem.command = {
      title: 'TEST',
      command: 'editor.action.triggerSuggest',
    }

    return completionItem
  })
}
