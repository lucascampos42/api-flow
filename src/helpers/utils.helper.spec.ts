import { paginationClause } from './utils.helper';
import { DEFAULT_LIMIT } from '../types/common.types';

describe('paginationClause', () => {
  it('should return correct pagination clause with all parameters', () => {
    const params = {
      limit: 20,
      page: 2,
      orderBy: 'asc' as const,
      orderField: 'name',
    };
    const result = paginationClause(params);
    expect(result).toEqual({
      skip: 20,
      take: 20,
      orderByClause: {
        name: 'asc',
      },
    });
  });

  it('should use default values for orderBy and orderField', () => {
    const params = {
      limit: 15,
      page: 3,
    };
    const result = paginationClause(params);
    expect(result).toEqual({
      skip: 30,
      take: 15,
      orderByClause: {
        createdAt: 'desc',
      },
    });
  });

  it('should use DEFAULT_LIMIT when limit is not provided', () => {
    const params = {
      page: 1,
    };
    const result = paginationClause(params);
    expect(result).toEqual({
      skip: 0,
      take: DEFAULT_LIMIT,
      orderByClause: {
        createdAt: 'desc',
      },
    });
  });

  it('should return skip as undefined when page is not provided', () => {
    const params = {
      limit: 10,
    };
    const result = paginationClause(params);
    expect(result).toEqual({
      skip: undefined,
      take: 10,
      orderByClause: {
        createdAt: 'desc',
      },
    });
  });

  it('should handle page 1 correctly (skip 0)', () => {
    const params = {
      limit: 10,
      page: 1,
    };
    const result = paginationClause(params);
    expect(result.skip).toBe(0);
  });

  it('should handle different orderField values', () => {
    const params = {
      limit: 10,
      page: 1,
      orderField: 'updatedAt',
    };
    const result = paginationClause(params);
    expect(result.orderByClause).toEqual({
      updatedAt: 'desc',
    });
  });
});
