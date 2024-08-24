import * as vscode from 'vscode'
import { TSConfigStore } from './TSConfigStore'
import { CompletionProvider } from './CompletionProvider'
import { VSCodeConfigStore } from './VSCodeConfigStore'

export function activate(vscodeContext: vscode.ExtensionContext) {
  console.clear()

  const tsconfigPathStore = new TSConfigStore()
  const vscodeConfigStore = new VSCodeConfigStore()

  const provider = vscode.languages.registerCompletionItemProvider(
    ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
    {
      provideCompletionItems(document, position, _, context) {
        let triggerCharacter = context.triggerCharacter

        if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
          const lastChar = document.getText(
            new vscode.Range(
              new vscode.Position(position.line, position.character - 1),
              position
            )
          )

          triggerCharacter = lastChar
        }

        if (triggerCharacter === '/') {
          return new CompletionProvider(
            vscodeConfigStore.get(),
            tsconfigPathStore.get(document.uri.fsPath),
            vscodeContext,
            context,
            document,
            position
          ).provideCompletionItems()
        }
      },
    },
    '/'
  )

  vscodeContext.subscriptions.push(provider)
}

export function deactivate() {
  console.log('deactivated')
}
