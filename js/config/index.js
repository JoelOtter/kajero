var env = process.env.NODE_ENV || 'development';

var config = {
    development: require('./development.config')
};

module.exports = config[env];
