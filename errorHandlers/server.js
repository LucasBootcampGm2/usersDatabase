const serverHandleErrors = (err, req, res, next) => {
  if (err) {
    const errorMessage = err.message;
    const statusCode = err.statusCode;
    console.error("Error stack:", err.stack);
    res.status(statusCode).json({ error: errorMessage });
  }
  next();
};

export { serverHandleErrors };
