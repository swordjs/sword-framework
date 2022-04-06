import { prompt } from 'enquirer';

export default async () => {
  const projectName = await prompt({
    type: 'input',
    name: 'name',
    message: '项目名称'
  });
  console.log(projectName['name']);
};
