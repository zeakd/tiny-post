# Tinypost


## Usage


tinypost.config.js

``` js
const { markdown } = require('tinypost/middlewares');

module.export = {
  outDir: 'build',
  parse,
  ext: ['.md', '.markdown']
  middlewares: [
    markdown(),
  ],
}
```

## root priority

- use `config.cwd` in tiny.config.js. 
- use `process.cwd()` if `--config` options.
- nearest `package.json` dirname.
- `process.cwd()`