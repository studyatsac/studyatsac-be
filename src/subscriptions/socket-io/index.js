const fs = require('fs');
const path = require('path');

const subscriptions = {};

const setupSubscription = () => {
    const basename = 'index.js';
    const dirname = `${__dirname}`;

    fs.readdirSync(dirname)
        .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
        .forEach((file) => {
            const model = require(path.join(dirname, file))();
            subscriptions[model.name] = model;
        });
};

module.exports = Object.assign(subscriptions, {
    setupSubscription
});
