import matter from 'gray-matter'

const parser = (raw, options) => {
  const { data, content } = matter(raw, options);

  return {
    ...data,
    content,
  }
}

export default parser