import { format } from 'date-fns';
import { startDevProxy } from './dev-proxy/dev-proxy';
import { buildFunctions, buildFunctionsWatch } from './functions/build';
import { Cmd, RunP, RunS, runScript, ScriptEntries } from './scripts';
import { copySecrets } from './secrets/copy';
import { packSecrets } from './secrets/pack';
import { unpackSecrets } from './secrets/unpack';
import { checkUnusedExports } from './unused-exports/check';

const entries: ScriptEntries = [
  // hello
  ['hello', Cmd('echo hello')],

  // checking
  ['lint', Cmd('eslint --ext .ts,.tsx src')],
  ['ts-check', Cmd('tsc --noEmit')],
  ['ts-unused', checkUnusedExports],

  // functions
  ['functions.build', buildFunctions],
  ['functions.build.watch', buildFunctionsWatch],

  // firebase
  [
    'firebase.serve',
    Cmd('firebase emulators:start --import=./emu-data --export-on-exit', 'firebase'),
  ],
  ['firebase.start', RunP(['functions.build.watch', 'firebase.serve'])],
  ['firebase.docs', Cmd('docsify serve docs', 'firebase')],

  [
    'firebase.build',
    RunS([
      'functions.build',
      'console.build',
      'client.build',
      Cmd('cp -a dist/console/www-dist firebase/console'),
      Cmd('cp -a dist/client/www-dist firebase/client'),
    ]),
  ],

  [
    'firebase.deploy',
    RunS(['lint', 'firebase.build', 'ts-check', Cmd('firebase deploy', 'firebase')]),
  ],

  // client
  [
    'main.start',
    Cmd(
      'stencil build --dev --watch --serve --service-worker --max-workers 1 --config scripts/main/stencil.config.ts',
    ),
  ],
  ['main.build', Cmd('stencil build --max-workers 1 --config scripts/main/stencil.config.ts')],

  // secrets
  ['secrets.copy', copySecrets],
  ['secrets.pack', packSecrets],
  ['secrets.unpack', unpackSecrets],

  // dev-proxy
  ['dev-proxy.start', startDevProxy],

  // test
  ['test', Cmd('FIREBASE_CONFIG={} jest --maxWorkers=1')],
];

const main = async () => {
  const name = process.argv[2];
  if (!name) {
    const scripts = entries.map(v => v[0]);
    scripts.sort();
    console.log(scripts.join('\r\n'));
    return;
  }

  const args = process.argv.slice(3);

  console.log(`## ${format(Date.now(), 'HH:mm:ss')} ##`, '\n');

  await runScript(entries, name, args);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
