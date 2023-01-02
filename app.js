require('dotenv').config();

const https = require('https');
const fs = require('fs');

const Server = require('./models/server');
const { endianness } = require('os');

const server = new Server();
server.listen();

if (process.env.SSL_CONNECT.toLowerCase() === 'true') {
    let chkFiles = true;

    if (process.env.KEY_FILE.trim() === '') {
        console.log(`KEY_FILE parameter is empty`);
        chkFiles = false;
    } else if (!fs.existsSync(process.env.KEY_FILE)) {
        console.log(`${process.env.KEY_FILE}: Private key file does not exist`);
        chkFiles = false;
    }

    if (process.env.CERT_FILE.trim() === '') {
        console.log(`CERT_FILE parameter is empty`);
        chkFiles = false;
    } else if (!fs.existsSync(process.env.CERT_FILE)) {
        console.log(`${process.env.CERT_FILE}: Certificate file does not exist`);
        chkFiles = false;
    }

    if (chkFiles) {
        const options = {
            key: fs.readFileSync(process.env.KEY_FILE, 'utf8'),
            cert: fs.readFileSync(process.env.CERT_FILE, 'utf8')
        };
        const serverHttps = https.createServer(options, server.app);
        serverHttps.listen(process.env.PORT_HTTPS);
        console.log('Secure server running on port ', process.env.PORT_HTTPS );
    }
}


