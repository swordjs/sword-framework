import { addPlugin } from '../core/plugin';

/**
 *
 * 使用插件
 * @description 使用`usePlugin`之后会返回一个对象，此对象有add等一系列函数，你可以编写自定义插件，也可以直接使用sword的内置插件
 *@example
 *  const plugin = usePlugin();
 *  plugin.add(() => {
 *    return {
 *      name: "test-plugin",
 *      log: {
 *        success: (message: string) => {
 *        console.log(message)
 *      }
 *     }
 *    }
 *  })
 * @return {*}
 */
export const usePlugin = () => {
  return {
    add: addPlugin
  };
};
