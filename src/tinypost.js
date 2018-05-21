// modules
import path from 'path'
import fs from 'fs-extra'
import globby from 'globby'

// tinypost functions
import loadConfig from './loadConfig'
import parser from './parser'

// utils
import replaceExt from './utils/replaceExt'

async function tinypost (globs, options) {
  
  ////
  // get configuration.
  const config = await loadConfig(options);
  const { cwd } = config;
  
  console.log('config', config)

  ////
  // get all target sources.
  const srcPaths = (await globby(globs, { 
    cwd: config.cwd, 
    expandDirectories: {
      extensions: config.extensions, 
    }
  }));

  console.log(srcPaths);

  ////
  // Parse source files.
  // use parse function or parser, and save parsed data to 'page'
  const pages = {};
  const parse = typeof config.parse === 'function' ? config.parse : parser(config.parse);

  await Promise.all(srcPaths.map(async srcPath => {

    // read source file.
    const absolutePath = path.resolve(cwd, srcPath);
    const file = await fs.readFile(absolutePath);
    const raw = file.toString();

    // parse it
    const parsed = parse(raw);

    // put additional info.
    // srcPath is unique.
    const id = srcPath; 
    Object.assign(parsed, {
      _id: id,
      _src: absolutePath,
      _dest: replaceExt(path.resolve(config.outDir, srcPath), 'html'),
    })

    // save it.
    pages[id] = parsed;

  }))

  console.log(pages)
}

export default tinypost