import path from 'path'
import readPkgUp from 'read-pkg-up'
import { markdown } from './middlewares'

const defaultConfigName = 'tinypost.config.js';
const defaultConfig = {
  outDir: 'build',
  ext: [
    '.md',
    '.markdown',
  ],
  middlewares: [
    markdown(),
  ],
  renderer: () => {
    
  }
}

const loadConfig = async _configName => {
  const cwd = process.cwd();

  const config = {
    ...defaultConfig,
    cwd,
  };

  let configName = defaultConfigName;
  try {
    if (_configName) {
      // if user config path.
      configName = _configName;

    } else {
      // if not, first find package.json
      const { pkg, path: pkgPath } = await readPkgUp();

      if (pkgPath) {
        Object.assign(config, {
          cwd: path.dirname(pkgPath),
        });
      }
    }

    const configPath = path.resolve(config.cwd, `${configName}`);
    Object.assign(config, require(configPath));
  } catch (err) {
    console.error(`Error: ${defaultConfigName}`)
    throw err;
  }

  // resolve destination path
  config.outDir = path.resolve(config.cwd, config.outDir);

  return config;
}

export default loadConfig 