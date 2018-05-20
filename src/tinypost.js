import path from 'path'
import fs from 'fs-extra'
import globby from 'globby'
import readPkgUp from 'read-pkg-up'

import loadConfig from './loadConfig'
import matter from './matter'
import chainMiddlewares from './utils/chainMiddlewares'
import replaceExt from './utils/replaceExt'
import getRenderer from './getRenderer'

/**
 * 
 * @param {string[]|string} src 
 * @param {object} options
 */
async function tinypost (_src, options) {
  const config = await loadConfig(options.config);
  const { cwd } = config;

  const src = typeof _src === 'string' 
    ? path.resolve(cwd, _src)
    : _src.map(s => path.resolve(cwd, s));

  // target files
  const filepaths = (await globby(src)).filter(f => config.ext.includes(path.extname(f)));

  // filepath -> rendered file
  const pipeline = makePipeline(config);

  await filepaths.map(pipeline);
}

/**
 * 
 * -> parse page front-matter
 * -> use middlewares
 * -> find layout renderer
 * -> render.
 * @param {*} _config 
 */
const makePipeline = (_config) => async filepath => {
  const config = _config ? _config : await loadConfig();

  // get string of file (raw).
  const file = await fs.readFile(filepath);
  const raw = file.toString();

  // parse file.
  const parsedPost = parse(raw, config);

  // make context
  const site = {}
  const global = { ...config.global };

  const context = {
    page: parsedPost,
    site,
    global,
  };
  
  // middleware chaining
  const middlewares = config.middlewares;
  const chainedMiddlewares = chainMiddlewares(middlewares);
  
  // run middlewares
  await chainedMiddlewares(context);  

  // render
  let rendered = await render(context, config);
  // console.log(rendered);

  // write rendered text to dest
  // TODO: Route
  const outFilename = replaceExt(path.relative(config.cwd, filepath), '.html');
  const outFilepath = path.resolve(config.outDir, outFilename);

  console.log(outFilepath)

  await fs.mkdirp(path.dirname(outFilepath));
  await fs.writeFile(outFilepath, rendered);

  return Promise.resolve();
}

function parse (raw, config) {
  if (!config.parse || typeof config.parse === 'object') {
    return matter(raw, config.parse);
  } else if (typeof config.parse === 'function') {
    return config.parse(raw);
  } else {
    // TODO: invalidate 
  }
}

async function render (context, config) {
  const layoutPath = context.page.layout;

  console.log(context)

  // if layout is not configured, render just content.
  // if layout is js file, use its middlewares and render function
  // else, use renderer for its ext.
  if (!layoutPath) {

    // no layout configure
    return context.page.content;
  } else {

    // in case layout is configured, 
    const layoutExt = path.extname(layoutPath);

    if (layoutExt === '.js' || layoutExt === '') {

      // js
      //  - find and use middlewares  
      //  - find render
      const localConfig = require(path.resolve(config.cwd, layoutPath));
      const localMiddlewares = localConfig.middlewares;
      const localRender = localConfig.render;

      const localChainedMiddlewares = chainedMiddlewares(localMiddlewares);
      localChainedMiddlewares(context);
      return await localRender(context);
    } else {

      // templates lang
      // - get renderer
      const templateRenderer = getRenderer(layoutExt);
      const template = (await fs.readFile(path.resolve(config.cwd, layoutPath))).toString();
      return await templateRenderer(template, context);
    }
  }
}

export default tinypost