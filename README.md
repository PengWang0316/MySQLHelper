# MySQLHelper

A helper to manage the connection pool for MySQL.

[![Build Status](https://travis-ci.org/PengWang0316/MySQLHelper.svg?branch=master)](https://travis-ci.org/PengWang0316/MySQLHelper)
[![Coverage Status](https://coveralls.io/repos/github/PengWang0316/MySQLHelper/badge.svg?branch=master)](https://coveralls.io/github/PengWang0316/MySQLHelper?branch=master)

# Installing

```
npm install --save @kevinwang0316/mysql-helper
```

# Usage

````javascript
// Node
const { initialPool, query, getPool, release } = require('@kevinwang0316/redis-helper');
// ES6
//import {
//  initialPool, query, getPool, release,
//} from '@kevinwang0316/redis-helper';

// Initialize the client before you use other functions (the default connectionLimit is 1 for the Lambda function)
initialPool('host', 'user', 'password', 'database');

// Set values
await setAsync('key', 'value');

// Query
query(sql, paramters, callback);
// Or use the async api
const { rows, fields } = await queryAsync(sql, paramters);

// Get MySQL pool if need
const pool = getPool();

// Release the pool if need (If you are using it in a Lambda function, do not release the pool in ordor to reuse)
release();
````

# License

RedisHelper is licensed under MIT License - see the [License file](https://github.com/PengWang0316/MySQLHelper/blob/master/LICENSE).
