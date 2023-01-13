function errorHandler(err, req, res, next) {
  if (err) {
    res.status(500).json({ error: "error in server" });
  }
}

module.exports = errorHandler;
