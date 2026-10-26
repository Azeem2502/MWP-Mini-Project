export const errorHandler = (err, req, res, next) => {
  console.error('[Server Error]', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongo Server Selection / Connection Error
  if (
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongooseServerSelectionError' ||
    err.message?.includes('ECONNREFUSED') ||
    err.message?.includes('buffering timed out')
  ) {
    statusCode = 503;
    message =
      'MongoDB is not running or unreachable. Please start MongoDB Community Server locally or configure MONGO_URI in server/.env';
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate field value entered for ${field}. Please use another value.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
