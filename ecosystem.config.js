module.exports = {
    apps: [{
        name: 'api',
        script: './index.js',
        exec_mode: 'cluster',
        instances: '2'
    }]
};
