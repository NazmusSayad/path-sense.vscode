import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

function getConfigFilePath() {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    return null
  }

  const configFile = path.join(workspaceFolders[0].uri.fsPath, 'tsconfig.json')
  return configFile
}

export default function () {
  const configFilePath = getConfigFilePath()
  if (!configFilePath || !fs.existsSync(configFilePath)) {
    return {}
  }

  const configContent = fs.readFileSync(configFilePath, 'utf-8')
  try {
    return JSON.parse(configContent)?.compilerOptions?.paths ?? {}
  } catch (e) {
    console.error('Error parsing config file:', e)
    return {}
  }
}
