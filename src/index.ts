import * as vscode from 'vscode'
import provideCompletionItems from './completion'

export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerCompletionItemProvider(
    ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
    {
      provideCompletionItems(document, position) {
        return provideCompletionItems(context, document, position)
      },
    },
    '/'
  )

  context.subscriptions.push(provider)
}
