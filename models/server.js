const express = require('express');
const cors = require('cors');

class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT;
        this.authPath = '/api/auth';
        this.customersPath = '/api/customers';
        this.salesOrderPath = '/api/orders';
        this.shippingAddress = '/api/shippingaddress';

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();
    }

    middlewares() {

        // CORS
        this.app.use( cors() );

        // Lectura y parseo del body
        this.app.use( express.json() );

        // Directorio Público
        this.app.use( express.static('public') );

    }

    routes() {
        this.app.use( this.authPath, require('../routes/auth'));
        this.app.use( this.customersPath, require('../routes/customers'));
        this.app.use( this.salesOrderPath, require('../routes/orders'));
        this.app.use( this.shippingAddress, require('../routes/shippingAddress'));
    }

    listen() {
        this.app.listen( this.port, () => {
            console.log('Server running on port ', this.port );
        });
    }

}

module.exports = Server;
