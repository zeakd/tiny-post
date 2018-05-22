// modules
import path from 'path'
import fs from 'fs-extra'
import globby from 'globby'
import marked from 'marked'

// tinypost functions
import loadConfig from './loadConfig'
import parser from './parser'
import Renderer from './Renderer'
import Watcher from './Watcher'

// utils
import replaceExt from './utils/replaceExt'

let watcher;

async function tinypost (globs, options) {

  ////
  // get configuration.
  const config = await loadConfig(options);
  const { cwd } = config;
  
  // console.log('config', config)

  // init watch
  if (config.watch) {
    if (!watcher) {
      watcher = new Watcher(config);
      watcher.on('change', () => {
        tinypost(globs, options);
      })
    }
  } else {
    if (watcher) watcher.close();
  }

  ////
  // get all target sources.
  const srcPaths = (await globby(globs, { 
    cwd, 
    expandDirectories: {
      extensions: config.extensions, 
    }
  }));

  if (config.watch) {
    watcher.add(srcPaths);
  }
  // console.log(srcPaths);

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

    if (config.watch) {
      if (parsed.layout) {
        watcher.add(parsed.layout);
      }
    }

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

  const context = {
    pages,
    site: {},
    global: { ...config.global },
  }

  makeCategories(context);
  makeTags(context);
  compileMarkdown()(context);

  // console.log(JSON.stringify(context, null, 2));

  //// 
  // renerer 
  const renderer = new Renderer(config);
  config.renderers.forEach(r => {
    const { extensions, render } = r;
    renderer.register(extensions, render);
  })

  // console.log(renderer);

  ////
  // render pages
  await Promise.all(Object.values(pages).map(async page => {
    const {
      layout,
      _dest: dest,
      content,
    } = page;

    const rendered = await renderer.render(layout, { ...context, page });

    // console.log(rendered);
    
    await fs.mkdirp(path.dirname(dest));
    await fs.writeFile(dest, rendered);
  }))
}

//// 
// add categories to context.site
function makeCategories (context) {
  const pages = context.pages;
  const categoryDB = {};

  Object.values(pages).forEach(page => {
    if (page.category) {
      categoryDB[page.category] = categoryDB[page.category] || [];
      categoryDB[page.category].push(page._id);
    }
  })

  context.site = context.site || {};
  context.site.category = categoryDB;
}

//// 
// add tags to context.site
function makeTags (context) {
  const pages = context.pages;
  const tagDB = {};

  Object.values(pages).forEach(page => {
    if (page.tags) {
      page.tags.forEach(tag => {
        tagDB[tag] = tagDB[tag] || [];
        tagDB[tag].push(page._id);
      })
    }
  });

  context.site = context.site || {};
  context.site.tag = tagDB;
}

const compileMarkdown = (options = {}) => context => {
  Object.keys(context.pages).forEach(id => {
    context.pages[id].content = marked(context.pages[id].content, options);
  })
}



export default tinypost