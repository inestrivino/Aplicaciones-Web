const texto1 = !/[._-]{2,}/.test("h__o.l.a");
console.log(texto1);
const texto2 = /^[A-Za-z0-9._-]+$/.test("Holaa-123,");
console.log(texto2);
const texto3 = /^[^@]+@[^@]+$/.test("hola@@hola");
console.log(texto3);