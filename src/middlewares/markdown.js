import marked from 'marked'

const markdownMiddleware = options => ({ page }) => {
  page.content = marked(page.content, options);
}

export default markdownMiddleware