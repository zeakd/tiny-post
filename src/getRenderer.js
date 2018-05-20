import nunjucks from './renderers/nunjucks'
import ejs from './renderers/ejs'

function getRenderer (ext, config) {
  if (['.nunjucks', '.nunjs', '.nj', '.njk'].includes(ext)) {
    return nunjucks
  }

  if (ext === '.ejs') {
    return ejs
  }
}

export default getRenderer