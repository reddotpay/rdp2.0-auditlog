const pathExist = (path) => {
  try {
    const requiredModule = require(path);
    return !!requiredModule;
  } catch (e) {
    return false;
  }
};

if (pathExist('dotenv')) require('dotenv').config();

module.exports = {
  ENVIRONMENT: process.env.ENVIRONMENT,
  DISPLAY_AUDITLOG: process.env.DISPLAY_AUDITLOG === 'true',
  CONSOLE_LOG: process.env.CONSOLE_LOG === 'true',
};
