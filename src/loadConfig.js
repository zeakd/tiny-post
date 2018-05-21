import path from 'path'
import readPkgUp from 'read-pkg-up'
import fs from 'fs-extra'

const defaultConfig = {
  outDir: 'build',
  extensions: ['md', 'markdown'],
  renderer: {
    nunjucks: {
      extensions: ['.nunjucks', '.njs'],
      render (template, context) {

      },
    },
    ejs: {
      extensions: ['.ejs'],
      render (template, context) {
        
      }
    }
  }
}

const defaultConfigName = 'tinypost.config.js'
/**
 * 1. look --config option that is user config path
 * 2. look package.json and tinypost.config.js of it.
 * 3. 
 * @param {object} options 
 */
async function loadConfig (options) {
  const {
    config: configPathOption,
    ...restOptions
  } = options;

  // initialize config object
  const config = {
    ...defaultConfig
  }

  ////
  // resolve cwd
  // 1. with --config option
  // 2. look package.json and tinypost.config.js
  // 3. process.cwd()
  let configName;
  let cwd;
  if (configPathOption) {

    cwd = process.cwd();
    configName = configPathOption;
  } else {

    const { pkg, path: pkgPath } = await readPkgUp();
    if (pkgPath) {

      cwd = path.dirname(pkgPath);
      configName = defaultConfigName;
    } else {

      cwd = process.cwd();
      configName = defaultConfigName;
    }
  }

  config.cwd = cwd;
  Object.assign(config, restOptions);

  ////
  // import config.js if it exists.
  const configPath = path.resolve(config.cwd, configName);
  if (await fs.exists(configPath)) {
    // merge with config.js
    try {

      const imported = require(configPath);
    
      if (typeof imported !== 'object') {
        throw new Error(`${configPath} should exports 'object' but, got '${typeof imported}'`);
      }
      Object.assign(config, imported);
    } catch (err) {

      // config.js exists, but something wrong.
      console.error(`Invalid: ${configPath}`);
      throw err
    }
  }

  // last. resolve with cwd
  config.outDir = path.resolve(config.cwd, config.outDir)

  return config;
}

export default loadConfig