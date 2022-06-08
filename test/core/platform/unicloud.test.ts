import { describe, it, expect } from 'vitest';
import { validateEvent } from '../../../packages/runtime/src/core/platform/unicloud/api';
import { asyncDependencyScheduler } from '../../../packages/runtime/src/core/schedule';
import type { UnicloudEvent } from '../../../typings/unicloud';

describe('validateEvent', async () => {
  await asyncDependencyScheduler();
  it('success event', () => {
    const event: UnicloudEvent = {
      route: '/test/test',
      method: 'GET',
      params: {},
      query: {}
    };
    // expect断言不等于true
    expect(validateEvent(event)).toBe(true);
  });
  it('error route', () => {
    const event: any = {
      route: true,
      method: 'GET',
      params: {},
      query: {}
    };
    const result = validateEvent(event);
    expect(result).not.toBe(true);
  });
  it('error method', () => {
    const event: any = {
      route: '111',
      method: true,
      params: {},
      query: {}
    };
    const result = validateEvent(event);
    expect(result).not.toBe(true);
  });
  it('pattern error method', () => {
    const event: any = {
      route: '111',
      method: 'get',
      params: {},
      query: {}
    };
    const result = validateEvent(event);
    expect(result).not.toBe(true);
  });
  it('pattern success method - 1', () => {
    const event: any = {
      route: '111',
      method: 'GET',
      params: {},
      query: {}
    };
    const result = validateEvent(event);
    expect(result).toBe(true);
  });
  it('pattern success method - 2', () => {
    const event: any = {
      route: '111',
      method: 'DELETE',
      params: {},
      query: {}
    };
    const result = validateEvent(event);
    expect(result).toBe(true);
  });
  it('error params', () => {
    const event: any = {
      route: '111',
      method: 'GET',
      params: true,
      query: {}
    };
    const result = validateEvent(event);
    expect(result).not.toBe(true);
  });
  it('error query', () => {
    const event: any = {
      route: '111',
      method: 'GET',
      params: {},
      query: true
    };
    const result = validateEvent(event);
    expect(result).not.toBe(true);
  });
});
