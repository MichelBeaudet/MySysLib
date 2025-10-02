// server.js
// Express server: serves the front-end and exposes a fresh JSON API.

const path = require('path');
const fs = require('fs');
const app = require('./app');

const PORT = process.env.PORT || 3000;

console.log(`*****************Server started ***************`);
console.log(`***In ${__filename}`);

app.listen(PORT, () => {
    console.log(`\n***Server listening on http://localhost:${PORT}`);
});
