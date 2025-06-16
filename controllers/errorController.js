const errorController = {};

errorController.triggerError = async (req, res, next) => {
  const error = {
    status: 500,
    message: "Intentional error triggered for testing purposes."
  };
  next(error);
};

module.exports = errorController;