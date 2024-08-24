const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')

const outdir = path.resolve(__dirname, 'dist')
if (fs.existsSync(outdir)) fs.rmSync(outdir, { recursive: true })

console.log('Checking types...')
const tscResult = spawn.sync('tsc', { stdio: 'inherit', shell: true })
if (tscResult.status !== 0) process.exit(tscResult.status)

console.log('Building package...')
spawn.sync('vsce', ['package', '--allow-missing-repository'], {
  stdio: 'inherit',
  shell: true,
})
