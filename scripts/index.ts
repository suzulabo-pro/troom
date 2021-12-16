import { Cmd, main, RunP, RunS, ScriptEntries } from '@suzulabo/ttscripts';
import { startDevProxy } from './dev-proxy/dev-proxy';
import { buildFunctions, buildFunctionsWatch } from './functions/build';
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

  [
    'firebase.build',
    RunS(['functions.build', 'main.build', Cmd('cp -a dist/main/www-dist firebase/main')]),
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

const name = process.argv[2];
const args = process.argv.slice(3);

main(entries, name, args).catch(err => {
  console.error(err);
  process.exit(1);
});
