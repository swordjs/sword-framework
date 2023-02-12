## @swordjs/sword-cors

sword 框架下的 cors 插件，不会被预设在 sword 中，需要手动添加插件

### 使用方法

```ts
import { useApp, usePipeline, usePlugin } from '@swordjs/sword-framework';
import { useCorsPlugin } from '@swordjs/sword-cors';

const plugin = usePlugin();
const pipeline = usePipeline();

plugin.add(useCorsPlugin());

const app = useApp();
```
