const responseHandler = (req, res, next) => {
    res.success = (message,data) => {
      res.status(res.statusCode||200 ).json({ success: true, data:data, message: message||'Success', status: res.statusCode,});
      
    };
    res.error = (message, statusCode = 400) => {
      res.status(statusCode).json({ success: false, data:null, message: message||'Error', status: statusCode });
    };
    next();
  };
  
  module.exports = responseHandler;
  