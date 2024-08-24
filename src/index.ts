import * as vscode from 'vscode'
import provideCompletionItems from './completion'

export function activate(vscodeContext: vscode.ExtensionContext) {
  console.clear()

  vscode.workspace.onDidSaveTextDocument((document) => {
    console.log(document.fileName)
  })

  vscode.workspace.onDidDeleteFiles((event) => {
    console.log(event.files)
  })

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
          return provideCompletionItems(vscodeContext, document, position)
        }
      },
    },
    '/'
  )

  const config = vscode.workspace.getConfiguration('path-sense')
  const mappings: Record<string, string> = config.get('mappings')
  const removeExtensions: string[] = config.get('remove-extensions')

  console.log({ ...mappings })
  console.log([...removeExtensions])

  vscodeContext.subscriptions.push(provider)
}

export function deactivate() {
  console.log('deactivated')
}
