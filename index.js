const general = require('./modules/general');
let { logArray } = require('./modules/logger');
const { environment, displayAuditlog } = require('./config');

class RDPLog {
  log(summary, variable) {
    const obj = {
      type: 'info',
      createdAt: new Date().toUTCString(),
      summary: typeof summary === 'string' ? summary : null,
      detail: variable ? general.clone(variable) : general.clone(summary),
      caller: [],
    };
    const firstTrace = general.getStackTrace();
    const secondTrace = general.getStackTrace(true);
    const thirdTrace = general.getStackTrace(true, true);

    if (firstTrace) obj.caller.push(firstTrace);
    if (secondTrace) obj.caller.push(secondTrace);
    if (thirdTrace) obj.caller.push(thirdTrace);

    logArray.push(obj);
  }

  error(summary, error) {
    const obj = {
      type: 'error',
      createdAt: new Date().toUTCString(),
      summary: typeof summary === 'string' ? summary : null,
      errorstack: error ? general.formatError(error) : general.formatError(summary),
      caller: [],
    };
    const firstTrace = general.getStackTrace();
    const secondTrace = general.getStackTrace(true);
    const thirdTrace = general.getStackTrace(true, true);

    if (firstTrace) obj.caller.push(firstTrace);
    if (secondTrace) obj.caller.push(secondTrace);
    if (thirdTrace) obj.caller.push(thirdTrace);

    logArray.push(obj);
  }

  audit(event, response) {
    const {
      httpMethod, path, requestContext, headers, body, queryStringParameters,
    } = event;

    let auditResponse;

    if (environment !== 'local') {
      const productIndex = headers && headers.Host.indexOf('.api');

      auditResponse = {
        product: headers && headers.Host.substr(0, productIndex),
        summary: `${httpMethod} ${path}`,
        createdAt: new Date().toUTCString(),
        sortDate: new Date().toJSON(),
        user: requestContext && requestContext.authorizer && {
          companyId: requestContext.authorizer.companyid,
          groupId: requestContext.authorizer.groupid,
          userId: requestContext.authorizer.uuid,
          username: requestContext.authorizer.username ? this.maskEmail(requestContext.authorizer.username) : null,
        },
        traceId: headers && headers['X-Amzn-Trace-Id'],
        stacktraceArray: logArray,
        request: {
          headers,
          queryStringParameters,
          body,
        },
        response,
      };
    } else {
      auditResponse = {
        summary: `${httpMethod} ${path}`,
        createdAt: new Date().toUTCString(),
        stacktraceArray: logArray,
        request: {
          headers,
          body,
          queryStringParameters,
        },
        response,
      };
    }

    // Log to Cloudwatch
    if (displayAuditlog === 'true') {
      if (httpMethod === 'OPTIONS') {
        console.log(auditResponse.summary);
      } else {
        console.log(general.convertToString(auditResponse));
      }
    }

    // Empty memory storage
    logArray = [];

    return auditResponse;
  }

  maskReturnDefault() {
    return '*'.repeat(16);
  }  

  maskEmail(email) {
    const username = email.split('@')[0];
    const firstThreeUsername = username.substr(0, 3);
    const domain = email.split('@')[1];

    let maskedEmail = email;
  
    if (username.length > 3) maskedEmail = `${firstThreeUsername}${'*'.repeat(username.length - 3)}@${domain}`;

    return maskedEmail;
  }

  maskCard(cardNumber) {
    // const digitsShown = 4;
    const firstSix = 6;
    const lastFour = 4;
    const cardLength = cardNumber.length;
    const first6Digit = cardNumber.substring(0, firstSix);
    const last4Digit = cardNumber.substring(cardLength-lastFour);
    return first6Digit + '*'.repeat(cardLength-(firstSix + lastFour)) + last4Digit;
    // return '*'.repeat(cardLength-lastFour) + last4Digit;
  }

  maskString(string) {
    return '*'.repeat(string.length);
  }

  maskObject(object) {
    if (typeof object === 'object') {
      const objectKeys = Object.keys(object);
      objectKeys.forEach((key) => {
        object[key] = this.maskReturnDefault();
      })      
    }
    return object;
  }
}

const rdpLog = new RDPLog();

module.exports = rdpLog;
