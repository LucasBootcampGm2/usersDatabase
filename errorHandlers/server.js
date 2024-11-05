const serverHandleErrors = (err, req, res, next) => {
  if (err) {
    const errorMessage = err.message;
    const statusCode = err.statusCode;
    const reqUrl = req.originalUrl;
    const reqMethod = req.method;
    const reqIP = req.ip;
    logger.error(
      `${
        statusCode || 500
      } - ${errorMessage} - ${reqUrl} - ${reqMethod} - ${reqIP}`
    );
    res.status(statusCode).json({ error: errorMessage });
  }
  next();
};

export { serverHandleErrors };
