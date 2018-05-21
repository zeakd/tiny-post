import matter from 'gray-matter'

const parser = options => text => {
  const { data, content } = matter(text, options);
  return {
    ...data,
    content,
  }
}

export default parser