# WebServer + RestServer

Recuerden que deben de ejecutar ```npm install``` para reconstruir los módulos de Node.

Creación de certificados autofirmados con OpenSSL:

openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem

openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
