import { useApp, usePipeline, usePlugin } from '@swordjs/sword-framework';

const plugin = usePlugin();
const pipeline = usePipeline();

const init = async () => {
  const app = await useApp();
  await app.implementApi();
  // 启动服务器
  app.server.start();
};

init();
