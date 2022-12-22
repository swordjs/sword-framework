import { writeFileRecursive } from '~util/file';
import { isDev } from '~util/env';
import log from './log';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { configData } from './config';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';
import type { Result } from './core/api';

export default async (args: Argv<CommandConfig>) => {
    if (isDev()) {
        try {
            const { share } = configData;
            // 读取api.json内容
            const apiJson: Result = JSON.parse(readFileSync(resolve(process.cwd(), `./src/api.json`), 'utf-8'));
            for (let key in apiJson) {
                // 获取其中的protopath, 并且读取文件内容
                const protoPath = apiJson[key].protoPath;
                const protoContent = readFileSync(protoPath as string).toString();
                const currentKey = `${key.substring(1).split("/").join("_")}.d.ts`;
                writeFileRecursive(resolve(share?.path as string, share?.dirName as string, share?.type?.dirName as string, currentKey), protoContent);
            }
            // 塞入package.json
            writeFileRecursive(resolve(share?.path as string, share?.dirName as string, share?.type?.dirName as string, `package.json`), JSON.stringify(share?.type?.package, null, 4));
            log.success(`Share success: ${share?.path}/${share?.dirName}/${share?.type?.dirName}`);
            log.success(`you can run \`npm publish\``)
        } catch (error) {
            log.err("Share failed, please check the configuration file");
        }
    } else {
        log.err(`When you run the share command, the current directory must be in the dev environment. 
        If you execute the command in the prod environment, this is not allowed, 
        because the api.json cache file is necessary for the share command in the dev environment, 
        and in the prod environment The api.json strips out the necessary analysis.`)
    }
}