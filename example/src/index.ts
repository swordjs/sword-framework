import { useApp, usePipeline, usePlugin } from '@sword-code-practice/sword-framework';

const plugin = usePlugin();
const pipeline = usePipeline();

const app = useApp();

const init = () => {
  app.implementApi();
  // 启动服务器
  app.server.start();
};

init();
