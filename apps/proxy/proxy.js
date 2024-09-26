const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ping = require('ping');
const nock = require('nock');
const { Command } = require('commander');

// Initialize Commander
const program = new Command();
program
    .option('-p, --port <number>', 'Port to run the server', 3000) // default to 3000
    .parse(process.argv);

const options = program.opts();

// Set the port using the command-line argument or the default
const PORT = options.port || process.env.PROXY_PORT || 3000;

const app = express();
app.use(express.json());

const REQUESTS_FILE = path.join(__dirname, 'requests.json');
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Initialize the requests file if it doesn't exist
if (!fs.existsSync(REQUESTS_FILE)) {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify({}));
}

app.post('/data', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }
    const payload = req.body;
    const headers = req.headers;
    const queryParams = { ...req.query };
    delete queryParams.url; // Remove the 'url' parameter

    try {
        await forwardRequest(targetUrl, payload, headers, queryParams);
        res.status(200).send('Request forwarded successfully');
    } catch (error) {
        saveRequest(targetUrl, payload, headers, queryParams);
        res.status(500).send('Failed to forward request, saved for later retry');
    }
});

app.post('/network', (req, res) => {
    const { nock: nockUrl, unnock: unnockUrl } = req.query;

    if (nockUrl) {
        nock(nockUrl)
            .post(/.*/)
            .replyWithError('Network failure');
        return res.status(200).send(`Nock activated for ${nockUrl}`);
    }

    if (unnockUrl) {
        nock.cleanAll();
        return res.status(200).send(`Nock deactivated for ${unnockUrl}`);
    }

    res.status(400).send('Query parameter nock or unnock is required');
});

async function forwardRequest(url, data, headers, queryParams) {
    const config = {
        headers,
        params: queryParams
    };
    await axios.post(url, data, config);
}

function saveRequest(url, data, headers, queryParams) {
    const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8'));
    if (!requests[url]) {
        requests[url] = [];
    }
    requests[url].push({ data, headers, queryParams });
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests));
}

async function checkConnectivity() {
    const isAlive = await ping.promise.probe('google.com');
    if (isAlive.alive) {
        resendRequests();
    }
}

function resendRequests() {
    const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8'));
    for (const url in requests) {
        if (requests[url].length > 0) {
            const dataArray = requests[url];
            dataArray.forEach(async (request) => {
                try {
                    await forwardRequest(url, request.data, request.headers, request.queryParams);
                } catch (error) {
                    console.error(`Failed to resend request to ${url}`, error);
                }
            });
            requests[url] = [];
        }
    }
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests));
}

// Check connectivity every 5 minutes
setInterval(checkConnectivity, CHECK_INTERVAL);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});