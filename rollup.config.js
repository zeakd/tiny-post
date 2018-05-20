import path from 'path'
import pkg from './package.json'
import mwPkg from './middlewares/package.json'

const external = [...Object.keys(pkg.dependencies), 'path']

export default [
  {
    input: 'src/middlewares.js',
    external,
    output: [
      {
        file: path.resolve('middlewares', mwPkg.main),
        format: 'cjs',
      },
      {
        file: path.resolve('middlewares', mwPkg.module),
        format: 'es',
      }
    ]
  },
  {
    input: 'src/index.js',
    external,
    output: [
      {
        file: pkg.main, 
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      }
    ]
  },
]