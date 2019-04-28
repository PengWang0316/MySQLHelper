import log from '@kevinwang0316/log';
import mysql from 'mysql';
// import { promisify } from 'util';

import {
  initialPool, getPool, query, release, queryAsync, format,
} from '../src/MySQLHelper';

const mockQueryReturn = { on: 'on' };
const mockQuery = jest.fn().mockReturnValue(mockQueryReturn);
const mockRelease = jest.fn();
// const mockQueryAsync = jest.fn().mockReturnValue(mockQueryReturn);

jest.mock('@kevinwang0316/log', () => ({
  debug: jest.fn(),
  error: jest.fn(),
}));
jest.mock('mysql', () => ({
  createPool: jest.fn().mockImplementation(() => ({
    query: mockQuery,
    release: mockRelease,
  })),
  format: jest.fn().mockReturnValue('format return value'),
}));
// jest.mock('util', () => ({ promisify: jest.fn().mockImplementation(() => mockQueryAsync) }));

describe('MySQLHelper', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getPool without initialization', () => {
    expect(getPool()).toBeUndefined();
    expect(log.debug).toHaveBeenCalledTimes(1);
    expect(log.debug).toHaveBeenLastCalledWith('The pool has not been created.');
  });

  test('query without initialization', () => {
    expect(query()).toBeNull();
    expect(log.debug).toHaveBeenCalledTimes(1);
    expect(log.debug).toHaveBeenLastCalledWith('The pool has not been created.');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('queryAsync without initialization', async () => {
    try {
      await queryAsync();
    } catch (err) {
      expect(err).toEqual(new Error('The pool has not been created.'));
    }
  });

  test('release without initialization', () => {
    release();

    expect(mockRelease).not.toHaveBeenCalled();
    expect(getPool()).toBeUndefined();
  });

  test('initialPool without an existed pool', () => {
    initialPool('host', 'user', 'pw', 'database', 10, { multipleStatements: true });

    expect(mysql.createPool).toHaveBeenCalledTimes(1);
    expect(mysql.createPool).toHaveBeenLastCalledWith({
      host: 'host',
      user: 'user',
      password: 'pw',
      database: 'database',
      connectionLimit: 10,
      multipleStatements: true,
    });
    // expect(promisify).toHaveBeenCalledTimes(1);
    expect(log.debug).toHaveBeenCalledTimes(1);
    expect(log.debug).toHaveBeenLastCalledWith('Creating a new connectin pool with connection limit 10');
    expect(getPool()).not.toBeNull();
    expect(getPool()).not.toBeUndefined();
  });

  test('initialPool with an existed pool', () => {
    initialPool('host', 'user', 'pw', 'database');

    expect(mysql.createPool).not.toHaveBeenCalled();
    expect(log.debug).toHaveBeenCalledTimes(1);
    expect(log.debug).toHaveBeenLastCalledWith('The connection pool has existed');
    expect(getPool).not.toBeNull();
    expect(getPool).not.toBeUndefined();
  });

  test('query with an existed pool', () => {
    const returnValue = query('a', 'b');

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenLastCalledWith('a', 'b');
    expect(log.debug).not.toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
    expect(returnValue).toEqual(mockQueryReturn);
  });

  test('release with an existed pool', () => {
    release();

    expect(mockRelease).toHaveBeenCalledTimes(1);
    expect(getPool()).toBeNull();
  });

  test('initialPool without an existed pool has error', () => {
    mysql.createPool.mockImplementationOnce(() => {
      throw new Error('error message');
    });

    initialPool('host', 'user', 'pw', 'database');

    expect(mysql.createPool).toHaveBeenCalledTimes(1);
    expect(mysql.createPool).toHaveBeenLastCalledWith({
      host: 'host', user: 'user', password: 'pw', database: 'database', connectionLimit: 1,
    });
    expect(log.debug).toHaveBeenCalledTimes(1);
    expect(log.debug).toHaveBeenLastCalledWith('Creating a new connectin pool with connection limit 1');
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(new Error('error message'));
  });

  test('query with an existed pool and error', () => {
    // mockQuery.mockImplementationOnce();
    // const newMockQueryAsync = jest.fn().mockImplementation(() => { throw new Error('error message'); });
    // promisify.mockReturnValueOnce(newMockQueryAsync);
    const newMockQuery = jest.fn().mockImplementation(() => { throw new Error('error message'); });
    mysql.createPool.mockReturnValueOnce({ query: newMockQuery, release: mockRelease });
    initialPool('host', 'user', 'pw', 'database');

    const returnValueA = query('a', 'b', 'c');

    expect(newMockQuery).toHaveBeenCalledTimes(1);
    expect(newMockQuery).toHaveBeenLastCalledWith('a', 'b', 'c');
    // expect(log.debug).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(new Error('error message'));
    expect(returnValueA).toEqual(null);

    // jest.clearAllMocks();
    // const returnValueB = queryAsync('a', 'b', 'c');

    // expect(newMockQueryAsync).toHaveBeenCalledTimes(1);
    // expect(newMockQueryAsync).toHaveBeenLastCalledWith('a', 'b', 'c');
    // // expect(log.debug).not.toHaveBeenCalled();
    // expect(log.error).toHaveBeenCalledTimes(1);
    // expect(log.error).toHaveBeenLastCalledWith(new Error('error message'));
    // expect(returnValueB).toEqual(null);
  });

  test('queryAsync with an existed pool', async () => {
    release();
    const newMockQuery = jest.fn().mockImplementationOnce((...args) => {
      args[args.length - 1](null, mockQueryReturn, {});
    });
    mysql.createPool.mockReturnValueOnce({ query: newMockQuery, release: mockRelease });
    initialPool('host', 'user', 'pw', 'database');

    const returnValue = await queryAsync('a', 'b');

    expect(newMockQuery).toHaveBeenCalledTimes(1);
    expect(returnValue).toEqual({
      fields: {},
      rows: mockQueryReturn,
    });
  });

  test('queryAsync with an existed pool with error', async () => {
    release();
    const newMockQuery = jest.fn().mockImplementationOnce((...args) => {
      args[args.length - 1](new Error('error message'), mockQueryReturn, {});
    });
    mysql.createPool.mockReturnValueOnce({ query: newMockQuery, release: mockRelease });
    initialPool('host', 'user', 'pw', 'database');

    try {
      await queryAsync('a', 'b');
    } catch (err) {
      expect(err).toEqual(new Error('error message'));
    }
  });

  test('format', () => {
    const returnValue = format('query');

    expect(mysql.format).toHaveBeenCalledTimes(1);
    expect(mysql.format).toHaveBeenLastCalledWith('query');
    expect(returnValue).toBe('format return value');
  });
});
