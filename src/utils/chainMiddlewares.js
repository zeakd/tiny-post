/**
 * 
 * @param {*} middlewares 
 * @return {function} chained Middlewares
 */
function chainMiddlewares (middlewares) {
  return async context => {
    await middlewares.reduce(async (p, mw) => {
      return p.then(async () => {
        if (mw.length < 2) {
          return await mw(context);
        } else {
          return await new Promise((resolve, reject) => {
            mw(context, resolve);
          })
        }  
      })
    }, Promise.resolve())
  }
}

export default chainMiddlewares