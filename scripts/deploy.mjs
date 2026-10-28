// Kopiert alle von git verwalteten Dateien per rsync in die Zielordner aus .env:
//   DEPLOY_TARGET           alter gdi-Webserver (livecompile/), gleiche Struktur wie das Repository
//   DEPLOY_TARGET_LERNWERK  Ordner public/ von gdi-lernwerk; dort ist index.html die Startseite, der
//                           Editor (index.html dieses Repositorys) liegt als editor.html daneben
// Ziele ohne Eintrag in .env oder ohne vorhandenen Ordner werden übersprungen.
// Ignorierte, nie eingecheckte und in EXCLUDE genannte Dateien werden nicht kopiert, am Ziel wird nichts gelöscht.
// Zusätzliche Argumente (z. B. --dry-run) werden an rsync durchgereicht.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'

if (existsSync('.env')) process.loadEnvFile('.env')

const TARGETS = [
    { name: 'gdi', env: 'DEPLOY_TARGET', rename: {} },
    { name: 'gdi-lernwerk', env: 'DEPLOY_TARGET_LERNWERK', rename: { 'index.html': 'editor.html' } },
]

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

const rsync = (args, input) =>
    spawnSync('rsync', ['-a', '--omit-dir-times', '--itemize-changes', ...process.argv.slice(2), ...args], {
        input,
        stdio: [input === undefined ? 'inherit' : 'pipe', 'inherit', 'inherit'],
    }).status ?? 1

let deployed = 0
let failed = false
for (const { name, env, rename } of TARGETS) {
    let target = process.env[env]?.trim()
    if (!target) {
        console.log(`${name}: übersprungen, ${env} ist nicht in .env gesetzt.`)
        continue
    }
    if (!existsSync(target) || !statSync(target).isDirectory()) {
        console.log(`${name}: übersprungen, ${target} existiert nicht.`)
        continue
    }
    if (!target.endsWith('/')) target += '/'
    console.log(`${name}: ${target}`)

    let status = rsync(['--from0', '--files-from=-', './', target], files.filter((f) => !(f in rename)).join('\0'))
    for (const [from, to] of Object.entries(rename)) {
        if (files.includes(from)) status ||= rsync([from, target + to])
    }
    if (status !== 0) failed = true
    else deployed++
}

if (deployed === 0 && !failed) {
    console.error('Fehler: Kein Zielordner gefunden. DEPLOY_TARGET und/oder DEPLOY_TARGET_LERNWERK in .env setzen.')
    console.error('Beispiel: DEPLOY_TARGET=/pfad/zum/webserver/livecompile/')
    process.exit(1)
}
process.exit(failed ? 1 : 0)
