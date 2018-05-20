import nunjucks from 'nunjucks'
import pify from 'pify'

const pNunjucks = pify(nunjucks.renderString);

function nunjucksRender (template, context) {
  return pNunjucks(template, context);  
}

export default nunjucksRender