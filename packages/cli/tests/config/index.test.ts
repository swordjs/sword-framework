import { getConfig } from '../../src/config';

describe('获取配置对象', () => {
  it('1', async () => {
    console.log(1);
    const config = await getConfig();
    console.log(config);
  });
});
