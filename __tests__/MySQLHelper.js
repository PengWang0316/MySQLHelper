import log from '@kevinwang0316/log';
import mysql from 'mysql';

import {
  initialPool, getPool, query, release,
} from '../src/MySQLHelper';

const mockQueryReturn = { on: 'on' };
const mockQuery = jest.fn().mockReturnValue(mockQueryReturn);
const mockRelease = jest.fn();

jest.mock('@kevinwang0316/log', () => ({
  debug: jest.fn(),
  error: jest.fn(),
}));
jest.mock('mysql', () => ({
  createPool: jest.fn().mockImplementation(() => ({
    query: mockQuery,
    release: mockRelease,
  })),
}));

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

  test('release without initialization', () => {
    release();

    expect(mockRelease).not.toHaveBeenCalled();
    expect(getPool()).toBeUndefined();
  });

  test('initialPool without an existed pool', () => {
    initialPool('host', 'user', 'pw', 'database', 10);

    expect(mysql.createPool).toHaveBeenCalledTimes(1);
    expect(mysql.createPool).toHaveBeenLastCalledWith({
      host: 'host', user: 'user', password: 'pw', database: 'database', connectionLimit: 10,
    });
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
    const newMockQuery = jest.fn().mockImplementation(() => { throw new Error('error message'); });
    mysql.createPool.mockReturnValueOnce({ query: newMockQuery });
    initialPool('host', 'user', 'pw', 'database');

    const returnValue = query('a', 'b', 'c');

    expect(newMockQuery).toHaveBeenCalledTimes(1);
    expect(newMockQuery).toHaveBeenLastCalledWith('a', 'b', 'c');
    // expect(log.debug).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(new Error('error message'));
    expect(returnValue).toEqual(null);
  });
});
