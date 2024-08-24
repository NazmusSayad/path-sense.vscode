import * as vscode from 'vscode'

export class VSCodeConfigStore {
  private configStore: VSCodeConfigStore.Config

  constructor() {
    this.configStore = {} as VSCodeConfigStore.Config

    const config = vscode.workspace.getConfiguration('path-sense')
    for (const element of VSCodeConfigStore.configKeys) {
      this.configStore[element] = config.get(element) as any
    }

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('path-sense')) {
        const config = vscode.workspace.getConfiguration('path-sense')
        VSCodeConfigStore.configKeys.forEach((key) => {
          this.configStore[key] = config.get(key) as any
        })
      }
    })
  }

  get() {
    return this.configStore
  }
}

export module VSCodeConfigStore {
  export const configKeys = ['mappings', 'removeExtensions'] as const

  export type Config = {
    mappings: Record<string, string>
    removeExtensions: string[]
  }
}
