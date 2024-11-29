const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);

  res.render("error", {
    title: "Error",
    error: err.message,
    user: req.user,
  });
};
module.exports = errorHandler;
