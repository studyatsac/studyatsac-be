const fs = require('fs');
const path = require('path');

const subscription = {};
const basename = 'index.js';
const dirname = `${__dirname}`;

if (Object.keys(subscription).length === 0) {
    fs.readdirSync(dirname)
        .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
        .forEach((file) => {
            const model = require(path.join(dirname, file))();
            subscription[model.name] = model;
        });
}

module.exports = subscription;
