# RedisHelper

A helper to generate asynchronous client for Redis.

[![Build Status](https://travis-ci.org/PengWang0316/RedisHelper.svg?branch=master)](https://travis-ci.org/PengWang0316/RedisHelper)
[![Coverage Status](https://coveralls.io/repos/github/PengWang0316/RedisHelper/badge.svg?branch=master)](https://coveralls.io/github/PengWang0316/RedisHelper?branch=master)

# Installing

```
npm install --save @kevinwang0316/redis-helper
```

# Usage

````javascript
// Node
const { createClient, getAsync, setAsync, quit, getClient } = require('@kevinwang0316/redis-helper');
// ES6
//import { createClient, getAsync, setAsync, quit, getClient } from '@kevinwang0316/redis-helper';

// Initialize the client before you use other functions
createClient('host', 'port', 'password');

// Set values
await setAsync('key', 'value');

// Get values
const value = await getAsync('key');

// Get Redis client
const client = getClient();

// Quit client
quit();
````

# License

RedisHelper is licensed under MIT License - see the [License file](https://github.com/PengWang0316/RedisHelper/blob/master/LICENSE).
