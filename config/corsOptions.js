const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
            console.log("This is allowed origin: ", origin);
            callback(null, true);
        } else {
            console.log(`${origin} not allowed Origin`);
            callback(new Error('Not Allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200 // for legacy browsers
}
module.exports = corsOptions;