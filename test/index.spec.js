const expect = require('chai').expect;
const sinon = require('sinon');
const sampleData = require('./sample'); 

const rdpLog = require('../index');
let { logArray } = require('../modules/logger');

describe('class RDPLog() ->', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  });
  afterEach(() => {
    sandbox.restore();
  });
  describe('rdpLog.log(summary, variable)', () => {
    it('should create an object in logArray', () => {
      rdpLog.log('summary', 'variable');
      expect(logArray[0]).to.be.an('object');
      expect(logArray[0]).to.have.all.keys('type', 'createdAt', 'summary', 'detail', 'caller');
      expect(logArray[0].type).to.eql('info');
      expect(logArray[0].summary).to.eql('summary');
      expect(logArray[0].detail).to.eql('variable');
      expect(logArray[0].caller).to.be.an('array');
      logArray.length = 0;
    });
  });
  describe('rdpLog.log(summary)', () => {
    it('should create an object in logArray', () => {
      rdpLog.log('summary');
      expect(logArray[0]).to.be.an('object');
      expect(logArray[0]).to.have.all.keys('type', 'createdAt', 'summary', 'detail', 'caller');
      expect(logArray[0].type).to.eql('info');
      expect(logArray[0].summary).to.eql('summary');
      expect(logArray[0].detail).to.eql('summary');
      expect(logArray[0].caller).to.be.an('array');
      logArray.length = 0;
    });
  });
  describe('rdpLog.log()', () => {
    it('should create an object in logArray', () => {
      rdpLog.log();
      expect(logArray[0]).to.be.an('object');
      expect(logArray[0]).to.have.all.keys('type', 'createdAt', 'summary', 'detail', 'caller');
      expect(logArray[0].type).to.eql('info');
      expect(logArray[0].summary).to.eql(null);
      expect(logArray[0].detail).to.eql(undefined);
      expect(logArray[0].caller).to.be.an('array');
      logArray.length = 0;
    });
  });
  describe('rdpLog.error(summary, error)', () => {
    it('should create an object in logArray', () => {
      rdpLog.error('summary', 'error');
      expect(logArray[0]).to.be.an('object');
      expect(logArray[0]).to.have.all.keys('type', 'createdAt', 'summary', 'errorstack', 'caller');
      expect(logArray[0].type).to.eql('error');
      expect(logArray[0].summary).to.eql('summary');
      expect(logArray[0].errorstack).to.eql('error');
      expect(logArray[0].caller).to.be.an('array');
      logArray.length = 0;
    });
  });
  describe('rdpLog.error(summary)', () => {
    it('should create an object in logArray', () => {
      rdpLog.error('summary');
      expect(logArray[0]).to.be.an('object');
      expect(logArray[0]).to.have.all.keys('type', 'createdAt', 'summary', 'errorstack', 'caller');
      expect(logArray[0].type).to.eql('error');
      expect(logArray[0].summary).to.eql('summary');
      expect(logArray[0].errorstack).to.eql('summary');
      expect(logArray[0].caller).to.be.an('array');
      logArray.length = 0;
    });
  });
  describe('rdpLog.error()', () => {
    it('should create an object in logArray', () => {
      rdpLog.error();
      expect(logArray[0]).to.be.an('object');
      expect(logArray[0]).to.have.all.keys('type', 'createdAt', 'summary', 'errorstack', 'caller');
      expect(logArray[0].type).to.eql('error');
      expect(logArray[0].summary).to.eql(null);
      expect(logArray[0].errorstack).to.eql(undefined);
      expect(logArray[0].caller).to.be.an('array');
      logArray.length = 0;
    });
  });
  describe('rdpLog.audit(event, response)', () => {
    it('should return an object', () => {
      const circularObject = sampleData.circularObject;
      circularObject.c = circularObject;

      rdpLog.log('nestedObject>>', sampleData.nestedObject);
      rdpLog.log('circularObject>>', circularObject);
      const result = rdpLog.audit(sampleData.event, sampleData.response);
      expect(result).to.be.an('object');
      expect(result).to.have.all.keys('product', 'summary', 'createdAt', 'sortDate', 'user', 'traceId', 'stacktraceArray', 'request', 'response');
    });
  });
  describe('rdpLog.maskReturnDefault()', () => {
    it('should return 16 asterisk', () => {
      const result = rdpLog.maskReturnDefault();
      expect(result).to.be.a('string');
      expect(result).to.eql('****************');
    });
  });
  describe('rdpLog.maskEmail(email)', () => {
    it('should return masked email with only first 3 letters visible', () => {
      const result = rdpLog.maskEmail(sampleData.email);
      expect(result).to.be.a('string');
      expect(result).to.eql('tes*@test.com');
    });
  });
  describe('rdpLog.maskCard(cardNumber)', () => {
    it('should return masked card number with only first 6 and last 4 digits visible', () => {
      const result = rdpLog.maskCard(sampleData.cardNumber);
      expect(result).to.be.a('string');
      expect(result).to.eql('111122******4444');
    });
  });
  describe('rdpLog.maskString(string)', () => {
    it('should return masked string', () => {
      const result = rdpLog.maskString(sampleData.string);
      expect(result).to.be.a('string');
      expect(result).to.eql('******');
    });
  });
  describe('rdpLog.maskObject(object)', () => {
    it('should return masked object', () => {
      const result = rdpLog.maskObject(sampleData.object);
      expect(result).to.be.an('object');
      expect(result).to.have.all.keys('key1', 'key2', 'key3');
      expect(result.key1).to.eql('****************');
      expect(result.key2).to.eql('****************');
      expect(result.key3).to.eql('****************');
    });
  });
});;
