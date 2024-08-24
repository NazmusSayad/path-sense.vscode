import * as path from 'path'
import * as ts from 'typescript'
import * as vscode from 'vscode'

export class TSConfigStore {
  private configStore: Map<string, TSConfigStore.Config> = new Map()

  constructor() {
    const watcher = vscode.workspace.createFileSystemWatcher(
      '**/tsconfig.json',
      false,
      false,
      false
    )

    watcher.onDidCreate((event) => this.onWatcherCreate(event))
    watcher.onDidChange((event) => this.onWatcherChange(event))
    watcher.onDidDelete((event) => this.onWatcherDelete(event))
    vscode.workspace.findFiles('**/tsconfig.json').then((uris) => {
      uris.forEach((uri) => this.onWatcherCreate(uri))
    })
  }

  get(filePath: string) {
    const tsconfigPath = this.findTSConfig(filePath)
    if (!tsconfigPath) return null
    return this.configStore.get(path.resolve(tsconfigPath)) || null
  }

  private onWatcherCreate(event: vscode.Uri) {
    const configPath = path.resolve(event.fsPath)
    const config = this.readTSConfig(configPath)
    this.configStore.set(configPath, config)
    console.log([...this.configStore.keys()])
  }

  private onWatcherChange(event: vscode.Uri) {
    const configPath = path.resolve(event.fsPath)
    const config = this.readTSConfig(configPath)
    this.configStore.set(configPath, config)
    console.log([...this.configStore.keys()])
  }

  private onWatcherDelete(event: vscode.Uri) {
    const configPath = event.fsPath
    this.configStore.delete(path.resolve(configPath))
    console.log([...this.configStore.keys()])
  }

  private findTSConfig(filePath: string) {
    return ts.findConfigFile(filePath, ts.sys.fileExists, 'tsconfig.json')
  }

  private readTSConfig(tsconfigPath: string): TSConfigStore.Config {
    const configJsonString = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
    if (configJsonString.error) {
      throw new Error(
        ts.formatDiagnostic(configJsonString.error, ts.createCompilerHost({}))
      )
    }

    const configObj = ts.parseJsonConfigFileContent(
      configJsonString.config,
      ts.sys,
      path.dirname(tsconfigPath)
    )

    return {
      ...configObj.options,
      configFilePath: tsconfigPath,
      configDirPath: path.dirname(tsconfigPath),
    }
  }
}

export module TSConfigStore {
  export type Config = ts.CompilerOptions & {
    configFilePath: string
    configDirPath: string
  }
}
