module.exports = async (logger) => {
  return new Promise((resolve, reject) => {
    logger.sendAndClose((err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
