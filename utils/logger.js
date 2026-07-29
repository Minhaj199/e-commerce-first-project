const winston = require("winston");
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");

const logtail = new Logtail(process.env.BETTERSTACK_SOURCE_TOKEN,{
    endpoint:'https://s2636263.eu-central-1a.betterstackdata.com'
});
const logger = winston.createLogger({
  transports: [
    new LogtailTransport(logtail),
  ],
});

module.exports = logger;