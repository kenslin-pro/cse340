const utilities = require("../utilities/")
const errorCont = {}

errorCont.BuildByErrorCode = async function (req, res, next) {
    console.log("in errorCont.BuildByErrorCode")
    console.log('known status', req.path.split("/")[2])

    // falsy defaults to 404
 const status = parseInt(req.path.split("/")[2]) || 404
 let message

switch (status) {
    case 500:
        message = "Our engine broke down! We're sorry for the inconvenience. Try ductaping it!"
        break;
    default:
        message = '<br>Render fender bender!🚧💥🚙 <br>You\'ve bumped into an unknown page, but the rest of the site is roadworthy!”<br>🚗💥🚙<br> <a href="/">Return home</a>'
        break;
}

return {status, message}

}

module.exports = errorCont