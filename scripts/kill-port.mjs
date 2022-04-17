import { spawn, spawnSync } from 'child_process';

// 批量根据端口号结束进程
// 获取script中的参数
const args = process.argv.slice(2);
let [start, end] = args;

start = Number(start);
end = Number(end);

for (let port = start; port <= end; port++) {
  spawn(`lsof`, [`-i`, `:${port}`]).stdout.on('data', (data) => {
    // 杀掉进程port
    const [pName, pId] = data.toString().trim().split(/\n/)[1].split(/\s+/);
    if (pId) {
      spawnSync('kill', ['-9', pId]);
    }
  });
}
