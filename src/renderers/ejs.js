import ejs from 'ejs'

function ejsRender (template, context) {
  return ejs.render(template, context)
}

export default ejsRender