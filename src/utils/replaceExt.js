import path from 'path'

function replaceExt (filepath, _ext) {
  const ext = _ext[0] === '.' ? _ext : `.${_ext}`;
  const { dir, name } = path.parse(filepath);
  return path.format({ dir, name, ext });
}

export default replaceExt