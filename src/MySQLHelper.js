import mysql from 'mysql';
import log from '@kevinwang0316/log';

let pool;

export const initialPool = (host, user, password, database, connectionLimit = 1) => {
  if (!pool) {
    log.debug(`Creating a new connectin pool with connection limit ${connectionLimit}`);
    try {
      pool = mysql.createPool({
        connectionLimit,
        host,
        user,
        password,
        database,
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

export const release = () => {
  if (pool) {
    pool.release();
    pool = null;
  }
};