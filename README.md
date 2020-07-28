# RDP2.0-Auditlog
[![npm (scoped)](https://img.shields.io/npm/v/@reddotpay/rdp2.0-auditlog.svg)](https://www.npmjs.com/package/@reddotpay/rdp2.0-auditlog)

Audit log npm package for RDP2.0 products

### Install
1. `npm install @reddotpay/rdp2.0-auditlog dotenv`
2. `npm install aws-sdk --save-dev`
3. refer to *Sample Environment File* for environment variables

##### Sample Environment File
```
ENVIRONMENT=development | staging | production
DISPLAY_AUDITLOG=true
```

### Requirements
AWS Role can refer to *Policy* below.

##### Policy
```yaml
BackendFunctionRole
	Type: AWS::IAM::Role
	Properties:
		AssumeRolePolicyDocument:
		Version: '2012-10-17'
		Statement:
		-
			Effect: Allow
			Action:
			- 'sts:AssumeRole'
			Principal:
				Service:
				- lambda.amazonaws.com

		Policies:
		-
			PolicyName: {Product}BackendFunctionRole
			PolicyDocument:
				Version: '2012-10-17'
				Statement:
				-
					Effect: Allow
					Action:
					- 'logs:*'
					Resource: '*'
```

### Usage

#### Primary Function
```js
/*
    DATA TYPE
    summmary {string} - description of log / error
    variable {any} - the variable to log
    error {object} - error object return in catch block
    event {object} - lambda event
    response {object} - response that is return to frontend
*/

Function 1: rdp.log(summary, variable); - equivalent to console.log
Function 2: rdp.error(summary, error); - equivalent to console.error
Function 3: await rdp.audit(event, response); - only called once before return response
```

##### Example
```
// index.js

const rdp = require('@reddotpay/rdp2.0-auditlog');

exports.handler = (event) => {
    /*
        All the Lambda Routes
    */
    const product = 'Product Name';

    // use one of the below
    rdp.audit(event, response); <==== fn 3
    rdp.auditRdp2(product, event, response); <==== for RDP 2 calls through API gateway
    rdp.auditRdp2Lambda(product, event, response); <==== for RDP 2 direct lambda invocation

    return response;
}
```

```js
// models/test.js

const axios = require('axios');
const rdp = require('@reddotpay/rdp2.0-auditlog');

class test {
    async get(input) {
        try {
            rdp.log('test get route>>', input); <==== fn 1
            ...
        } catch (e) {
            rdp.error('test get route error>>', e); <==== fn 2
            ...
        }

        return;
    }

    async post(input) {
        try {
            rdp.log('test get route>>', input); <==== fn 1
            ...
        } catch (e) {
            rdp.error('test get route error>>', e); <==== fn 2
            ...
        }

        return;
    }
}
```

##### Response
```js
{
  product: 'productName',
  summary: `${httpMethod} ${path}`,
  type: 'info || error'
  createdAt: new Date().toUTCString(),
  sortDate: new Date().toJSON(),
  user: {
    companyId: requestContext.authorizer.companyid,
    groupId: requestContext.authorizer.groupid,
    userId: requestContext.authorizer.uuid,
    username: requestContext.authorizer.username,
  },
  traceId: 'X-Amzn-Trace-Id',
  stacktraceArray: [
    // list of logs in chronological order
  ],
  request: {
    headers,
    queryStringParameters,
    body,
  },
  response: {
    // return response
  },
}
```

#### Masking Function
```js
rdp.maskReturnDefault();
rdp.maskEmail(email);
rdp.maskCard(cardNumber);
rdp.maskString(string);
rdp.maskObject(object);
```

##### Example
```js
const maskReturnDefault = rdp.maskReturnDefault();
// ****************
remarks: default is always 16 asterisk

const maskedEmail = rdp.maskEmail('username@domain.com');
// use*****@domain.com

const maskedCard = rdp.maskCard('1111222233334444');
// 111122******4444

const maskedString = rdp.maskString('teststring');
// **********

const maskedObject = rdp.maskObject({
    key1: "value1",
    key2: [1, 2, 3],
    key3: {
        nestedKey1: "nestedValue1",
        nestedKey2: "nestedValue2",
    },
});
/*
{
    key1: ****************,
    key2: ****************,
    key3: ****************,
}
*/
```
