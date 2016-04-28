var env = process.env.NODE_ENV || 'development';

var config = {
    development: require('./development.config'),
    production: require('./production.config')
};

module.exports = config[env];
