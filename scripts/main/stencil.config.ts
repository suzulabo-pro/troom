import replace from '@rollup/plugin-replace';
import { Config } from '@stencil/core';
import { OutputTargetWww } from '@stencil/core/internal';
import { sass } from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import * as path from 'path';

const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));

declare const process: {
  env: {
    [key: string]: string;
  };
  argv: string[];
};

const buildSrc = () => {
  {
    // GitHub Actions
    const sha = process.env['GITHUB_SHA'];
    const ref = process.env['GITHUB_REF'];
    if (sha && ref) {
      return `${ref.split('/').pop()}/${sha.substr(0, 7)}`;
    }
  }
  return 'local build';
};

const buildRepo = () => {
  {
    // GitHub Actions
    const server = process.env['GITHUB_SERVER_URL'];
    const repo = process.env['GITHUB_REPOSITORY'];
    if (server && repo) {
      return `${server}/${repo}`;
    }
  }
  return 'local build';
};

const isDev = process.argv.includes('--dev');

const outputTargetWww: OutputTargetWww = {
  type: 'www',
  serviceWorker: {
    swSrc: `${ROOT_DIR}/src/main/sw.js`,
    globPatterns: isDev ? ['index.html'] : ['**/*.{js,html}'],
  },
  dir: isDev ? `${ROOT_DIR}/dist/main/www` : `${ROOT_DIR}/dist/main/www-dist`,
  copy: [],
};

export const config: Config = {
  globalScript: `${ROOT_DIR}/src/main/global/app.ts`,
  srcDir: `${ROOT_DIR}/src/main`,
  sourceMap: isDev,
  taskQueue: 'async',
  outputTargets: [outputTargetWww],
  plugins: [
    sass({
      injectGlobalPaths: [`${ROOT_DIR}/src/global.scss`],
    }),
    replace({
      __BUILD_SRC__: buildSrc(),
      __BUILD_REPO__: buildRepo(),
      __BUILT_TIME__: new Date().getTime().toString(),
      preventAssignment: true,
    }),
  ],
  rollupPlugins: {
    after: [nodePolyfills()],
  },
  devServer: {
    openBrowser: false,
    port: 3370,
  },
};
