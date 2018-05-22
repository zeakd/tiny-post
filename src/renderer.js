import path from 'path'
import fs from 'fs-extra'

class Renderer {
  constructor (config) {

    this.cwd = config.cwd
    this.registered = {}
  }

  register (_extensions, render) {

    const extensions = Array.isArray(_extensions) ? _extensions : [_extensions];
    extensions.forEach(ext => {
      this.registered[ext] = render;
    })
  }

  // data.content required
  async render (layoutPath, data) {

    const renderer = this.getRenderer(layoutPath);
    if (!renderer) return data.content;

    const file = await fs.readFile(path.resolve(this.cwd, layoutPath));
    const layout = file.toString();
    
    return await renderer(layout, data);
  }

  getRenderer (layoutPath) {
    const ext = path.extname(layoutPath);

    return this.registered[ext];
  }
}

export default Renderer