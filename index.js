const general = require('./modules/general');
let { logArray } = require('./modules/logger');
const { ENVIRONMENT, DISPLAY_AUDITLOG, CONSOLE_LOG } = require('./config');

class RDPLog {
  log(summary, variable) {
    if (CONSOLE_LOG) console.log(summary, variable);

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
    if (CONSOLE_LOG) console.log(summary, error);

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

    const productIndex = headers && headers.Host && headers.Host.indexOf('.api');
    const product = headers && headers.Host && headers.Host.substr(0, productIndex);

    return this._audit(product, httpMethod, path, requestContext, headers, body, queryStringParameters, response);
  }

  auditRdp2(product, event, response) {
    const {
      httpMethod, path, requestContext, headers, body, queryStringParameters,
    } = event;

    this._audit(product, httpMethod, path, requestContext, headers, body, queryStringParameters, response);
  }

  auditRdp2Lambda(product, event, response) {
    const {
      httpMethod, requestContext, headers, body, queryStringParameters,
    } = event;

    const pathParams = event.pathParameters || {};
    let { path } = event;
    if (typeof path === 'undefined' || !path) {
      path = event.resource || '';
      Object.keys(pathParams).forEach((name) => {
        const param = pathParams[name];
        path = path.replace(`{${name}}`, param);
      });
    }

    this._audit(product, httpMethod, path, requestContext, headers, body, queryStringParameters, response);
  }

  _audit(product, httpMethod, path, requestContext, headers, body, queryStringParameters, response) {

    let auditResponse;

    if (ENVIRONMENT !== 'local') {
      auditResponse = {
        product,
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
    if (DISPLAY_AUDITLOG) {
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

  // empty logs
  flush() {
    logArray = [];
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
