﻿var environments = {};
environments.production = {
    'httpPort': 4000, 'httpsPort': 4001,
    'envName': 'production', 'hashsecret': 'SecretGiven',
    'stripehost': 'https://api.stripe.com/v1/charges',
    'stripesecret': 'sk_test_LgBQGVPAeZA7IQLXN8ZecR4Q'
};

environments.staging = {
    'httpPort': 4000, 'httpsPort': 4001, 'hashsecret':'SecretGiven',
    'envName': 'staging',
    'stripehost': 'https://api.stripe.com/v1/charges', 'stripesecret': 'sk_test_LgBQGVPAeZA7IQLXN8ZecR4Q'
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
