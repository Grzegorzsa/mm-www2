import { execSync } from 'node:child_process'

const pageSeedScripts = [
  'seed:terms-and-conditions',
  'seed:privacy-policy',
  'seed:cookie-policy',
  'seed:contact',
]

function runSeedScript(scriptName: string) {
  console.log(`\nRunning ${scriptName}...`)
  execSync(`pnpm run ${scriptName}`, { stdio: 'inherit' })
}

function seed() {
  for (const scriptName of pageSeedScripts) {
    runSeedScript(scriptName)
  }

  console.log('\nAll page seeds completed successfully.')
}

try {
  seed()
  process.exit(0)
} catch (err) {
  console.error('\nPage seeds failed.')
  console.error(err)
  process.exit(1)
}
