import loadConfig from './loadConfig'

async function tinypost (src, options) {
  const config = await loadConfig(options);

}

export default tinypost