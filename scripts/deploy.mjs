// Kopiert alle von git verwalteten Dateien per rsync nach DEPLOY_TARGET (aus .env).
// Ignorierte, nie eingecheckte und in EXCLUDE genannte Dateien werden nicht kopiert, am Ziel wird nichts gelöscht.
// Zusätzliche Argumente (z. B. --dry-run) werden an rsync durchgereicht.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

if (existsSync('.env')) process.loadEnvFile('.env')

const target = process.env.DEPLOY_TARGET?.trim()
if (!target) {
    console.error('Fehler: DEPLOY_TARGET ist nicht in .env gesetzt.')
    console.error('Beispiel: DEPLOY_TARGET=/pfad/zum/webserver/livecompile/')
    process.exit(1)
}

// Nur für die Entwicklung nötig, gehört nicht auf den Webserver
const EXCLUDE = [
    /(^|\/)\.gitignore$/,
    /(^|\/)\.DS_Store$/,
    /^\.prettierrc(\.\w+)?$/,
    /^\.env\.example$/,
    /^package\.json$/,
    /^README\.md$/,
    /^scripts\//,
]

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter((f) => f && !EXCLUDE.some((re) => re.test(f)))
    .join('\0')
const result = spawnSync(
    'rsync',
    ['-a', '--omit-dir-times', '--from0', '--files-from=-', '--itemize-changes', ...process.argv.slice(2), './', target.endsWith('/') ? target : target + '/'],
    { input: files, stdio: ['pipe', 'inherit', 'inherit'] }
)
process.exit(result.status ?? 1)
