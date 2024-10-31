const handleError = (err, req, res, next) => {
  const statusCode =
    err.status || (err.code && err.code.startsWith("SQLITE") ? 500 : 400);

  const errorMessage = err.message || "Unknown error";

  console.error("Error stack:", err.stack);

  res.status(statusCode).json({ error: errorMessage });
};

const logger = (req, res, next) => {
  console.log(`Request method used: ${req.method}, URL used: ${req.url}`);
  next();
};

export { handleError };
