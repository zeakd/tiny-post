import chokidar from 'chokidar'

class Watcher {
  constructor (config) {
    this.watcher = chokidar.watch([], { cwd: config.cwd });
  }

  add (files) {
    this.watcher.add(files);
  }

  close () {
    this.watcher.close();
  }

  on (...args) {
    this.watcher.on(...args);
  }
}

export default Watcher