const nock = require('nock');
const app = require('../proxy');
const fs = require('fs');
const path = require('path');
const supertest = require('supertest');
const { expect } = require('chai');

const REQUESTS_FILE = path.join(__dirname, '../requests.json');

describe('Proxy App', function() {
    beforeEach(function() {
        if (fs.existsSync(REQUESTS_FILE)) {
            fs.unlinkSync(REQUESTS_FILE);
        }
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify({}));
    });

    describe('POST /data', function() {
        it('should forward the request successfully', async function() {
            const targetUrl = 'http://example.com';
            const payload = { key: 'value' };
            const headers = { 'Content-Type': 'application/json' };
            const queryParams = { foo: 'bar' };

            nock(targetUrl)
                .post('/', payload)
                .query(queryParams)
                .reply(200, 'OK');

            const response = await supertest(app)
                .post('/data')
                .set(headers)
                .query({ url: targetUrl, foo: 'bar' })
                .send(payload);

            expect(response.status).to.equal(200);
            expect(response.text).to.equal('Request forwarded successfully');
        });

        it('should save the request if forwarding fails', async function() {
            const targetUrl = 'http://example.com';
            const payload = { key: 'value' };
            const headers = { 'Content-Type': 'application/json' };
            const queryParams = { foo: 'bar' };

            nock(targetUrl)
                .post('/', payload)
                .query(queryParams)
                .replyWithError('Network failure');

            const response = await supertest(app)
                .post('/data')
                .set(headers)
                .query({ url: targetUrl, foo: 'bar' })
                .send(payload);

            expect(response.status).to.equal(500);
            expect(response.text).to.equal('Failed to forward request, saved for later retry');

            const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8'));
            expect(requests[targetUrl]).to.have.lengthOf(1);
            expect(requests[targetUrl][0].data).to.deep.equal(payload);
            expect(requests[targetUrl][0].headers).to.deep.equal(headers);
            expect(requests[targetUrl][0].queryParams).to.deep.equal(queryParams);
        });

        it('should return 400 if URL is missing', async function() {
            const payload = { key: 'value' };

            const response = await supertest(app)
                .post('/data')
                .send(payload);

            expect(response.status).to.equal(400);
            expect(response.text).to.equal('URL is required');
        });
    });

    describe('POST /network', function() {
        it('should activate nock for the specified URL', async function() {
            const nockUrl = 'http://example.com';

            const response = await supertest(app)
                .post('/network')
                .query({ nock: nockUrl });

            expect(response.status).to.equal(200);
            expect(response.text).to.equal(`Nock activated for ${nockUrl}`);
        });

        it('should deactivate nock for the specified URL', async function() {
            const unnockUrl = 'http://example.com';

            const response = await supertest(app)
                .post('/network')
                .query({ unnock: unnockUrl });

            expect(response.status).to.equal(200);
            expect(response.text).to.equal(`Nock deactivated for ${unnockUrl}`);
        });

        it('should return 400 if nock or unnock is missing', async function() {
            const response = await supertest(app)
                .post('/network');

            expect(response.status).to.equal(400);
            expect(response.text).to.equal('Query parameter nock or unnock is required');
        });
    });
});
