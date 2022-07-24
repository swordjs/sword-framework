// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('🎉 Congratulations, sword.js helper is now active!');

  const rootPath =
    vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
  const apiProvider = new ApiProvider(rootPath);
  // 挂载command
  vscode.commands.registerCommand('Route.refreshEntry', () => apiProvider.refresh());
  vscode.commands.registerCommand('Route.addEntry', () => apiProvider.addRoute());
  // 读取api.json文件, 向route视图添加内容
  vscode.window.registerTreeDataProvider('Route', apiProvider);
}

export class ApiProvider implements vscode.TreeDataProvider<Api> {
  private _onDidChangeTreeData: vscode.EventEmitter<Api | undefined | void> = new vscode.EventEmitter<Api | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Api | undefined | void> = this._onDidChangeTreeData.event;
  constructor(private workspaceRoot: string | undefined) {}
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  addRoute(): void {
    // 让用户输入一个字符串
    vscode.window
      .showInputBox({
        prompt: '请输入路由名称',
        placeHolder: '例如hello, 程序会自动建立handler和proto文件, 路径是/hello'
      })
      .then((name) => {
        if (name && name.trim() !== '') {
          // exec命令
          try {
            execSync(`npx sword util --util-name=presetApi --presetApi-name=${name}`, {
              cwd: this.workspaceRoot
            });
          } catch (error) {
            return vscode.window.showErrorMessage((error as any).message);
          }
          // 成功窗口
          vscode.window.showInformationMessage(`success: ${name} added`);
          setTimeout(() => {
            // 刷新视图
            this.refresh();
          }, 1000);
        }
      });
  }
  getChildren(element?: Api | undefined): vscode.ProviderResult<any[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No api.json in empty workspace');
      return Promise.resolve([]);
    }
    if (element) {
      // 查看子菜单
      return Promise.resolve([
        {
          label: 'handler',
          iconPath: {
            light: path.join(__filename, '..', '..', 'media', 'core.svg'),
            dark: path.join(__filename, '..', '..', 'media', 'core.svg')
          },
          command: {
            command: 'vscode.open',
            arguments: [element.handlerPath]
          }
        },
        {
          label: 'proto',
          iconPath: {
            light: path.join(__filename, '..', '..', 'media', 'proto.svg'),
            dark: path.join(__filename, '..', '..', 'media', 'proto.svg')
          },
          command: {
            command: 'vscode.open',
            arguments: [element.protoPath]
          }
        }
      ]);
    }
    // 获取api.json文件的路径
    const apiJSONPath = path.join(this.workspaceRoot, 'src', 'api.json');
    if (this.pathExists(apiJSONPath)) {
      return Promise.resolve(this.parseApiJSON(apiJSONPath));
    } else {
      vscode.window.showInformationMessage('Workspace has no api.json');
      return Promise.resolve([]);
    }
  }
  getTreeItem(element: Api): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  /**
   *
   * 解析api.json文件
   * @param {string} apiJSONPath
   * @return {*}  {Api[]}
   * @memberof ApiProvider
   */
  parseApiJSON(apiJSONPath: string): Api[] {
    const apiJSON = JSON.parse(fs.readFileSync(apiJSONPath, 'utf-8'));
    console.log(apiJSON);
    const list = [];
    for (const key in apiJSON) {
      list.push(new Api(key, apiJSON[key].method, apiJSON[key].path, apiJSON[key].type, apiJSON[key].protoPath, vscode.TreeItemCollapsibleState.Collapsed));
    }
    return list;
  }
  // 检查文件是否存在
  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

export class Api extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly methods: string[],
    public readonly handlerPath: string,
    public readonly type: string,
    public readonly protoPath: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.description = `${this.methods.join(' | ')} - ${this.type === 'mandatory' ? '强制定义类型路由' : '文件系统类型路由'}`;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'media', 'api_light.svg'),
    dark: path.join(__filename, '..', '..', 'media', 'api_dark.svg')
  };
}

// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
