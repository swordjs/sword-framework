## @sword-code-practice/sword-cors

sword框架下的cors插件，不会被预设在sword中，需要手动添加插件

### 使用方法

```ts
import { useApp, usePipeline, usePlugin } from '@sword-code-practice/sword-framework';
import { useCorsPlugin } from "@sword-code-practice/sword-cors"

const plugin = usePlugin();
const pipeline = usePipeline();

plugin.add(useCorsPlugin());

const app = useApp();

```
