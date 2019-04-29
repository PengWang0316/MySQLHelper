import mysql from 'mysql';
import log from '@kevinwang0316/log';

let pool;

export const initialPool = (host, user, password, database, connectionLimit = 1, options = {}) => {
  if (!pool) {
    log.debug(`Creating a new connectin pool with connection limit ${connectionLimit}`);
    try {
      pool = mysql.createPool({
        connectionLimit,
        host,
        user,
        password,
        database,
        ...options,
      });
    } catch (err) {
      log.error(err);
    }
  } else log.debug('The connection pool has existed');
};

export const getPool = () => {
  if (!pool) log.debug('The pool has not been created.');
  return pool;
};

export const query = (...args) => {
  if (!pool) {
    log.debug('The pool has not been created.');
    return null;
  }

  try {
    return pool.query(...args);
  } catch (err) {
    log.error(err);
    return null;
  }
};

export const queryAsync = (...args) => new Promise((resolve, reject) => {
  if (!pool) reject(new Error('The pool has not been created.'));

  pool.query(...args, (err, rows, fields) => {
    if (err) reject(err);
    resolve({ rows, fields });
  });
});

export const release = () => {
  if (pool) {
    pool.release();
    pool = null;
  }
};

export const format = (sql, paramters = []) => mysql.format(sql, paramters);
