import { useApp, usePipeline, usePlugin } from '@sword-code-practice/sword-framework';

const plugin = usePlugin();
const pipeline = usePipeline();

const init = async () => {
  const app = await useApp();
  app.implementApi();
  // 启动服务器
  app.server.start();
};

init();
