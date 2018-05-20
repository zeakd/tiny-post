import path from 'path'

function replaceExt (filepath, ext) {
  const { dir, name } = path.parse(filepath);
  return path.format({ dir, name, ext });
}

export default replaceExt