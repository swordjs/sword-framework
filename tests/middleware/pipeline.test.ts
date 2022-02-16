import { useFlow } from '../../src';

const flow = useFlow();

flow.push((e: any) => {
  console.log(e, '接受到的值');
  return {
    text: '我是节点1'
  };
});

flow.push((e: any) => {
  console.log(e, '接受到的值1');
  return {
    text: '我是节点2'
  };
});
