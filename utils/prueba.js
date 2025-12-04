/*const texto1 = !/[._-]{2,}/.test("h__o.l.a");
console.log(texto1);
const texto2 = /^[A-Za-z0-9._-]+$/.test("Holaa-123,");
console.log(texto2);
const texto3 = /^[^@]+@[^@]+$/.test("hola@@hola");
console.log(texto3);

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

connection.connect(err => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conectado a MySQL');
});*/

fetch('/admin/rellenar', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: "Juan",
        email: "juan@mail.com",
        password: "123456"
    })
})