import { describe, it, expect } from 'vitest';
import { validateEvent } from '../../../src/core/platform/unicloud';
import type { UnicloudEvent } from '../../../typings/unicloud';

describe('validateEvent', () => {
  it('success event', () => {
    const event: UnicloudEvent = {
      route: '/test/test',
      method: 'GET',
      params: {},
      query: {}
    };
    expect(validateEvent()(event)).equals(true);
  });
  it('error route', () => {
    const event: any = {
      route: true,
      method: 'GET',
      params: {},
      query: {}
    };
    const result = validateEvent()(event);
    expect(result).equals(false);
  });
  it('error method', () => {
    const event: any = {
      route: '111',
      method: true,
      params: {},
      query: {}
    };
    const result = validateEvent()(event);
    expect(result).equals(false);
  });
  it('pattern error method', () => {
    const event: any = {
      route: '111',
      method: 'get',
      params: {},
      query: {}
    };
    const result = validateEvent()(event);
    expect(result).equals(false);
  });
  it('pattern success method - 1', () => {
    const event: any = {
      route: '111',
      method: 'GET',
      params: {},
      query: {}
    };
    const result = validateEvent()(event);
    expect(result).equals(true);
  });
  it('pattern success method - 2', () => {
    const event: any = {
      route: '111',
      method: 'DELETE',
      params: {},
      query: {}
    };
    const result = validateEvent()(event);
    expect(result).equals(true);
  });
  it('error params', () => {
    const event: any = {
      route: '111',
      method: 'GET',
      params: true,
      query: {}
    };
    const result = validateEvent()(event);
    expect(result).equals(false);
  });
  it('error query', () => {
    const event: any = {
      route: '111',
      method: 'GET',
      params: {},
      query: true
    };
    const result = validateEvent()(event);
    expect(result).equals(false);
  });
});
