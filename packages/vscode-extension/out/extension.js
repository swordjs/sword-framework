var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
export function activate(context) {
    console.log('🎉 Congratulations, sword.js helper is now active!');
    var rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    var apiProvider = new ApiProvider(rootPath);
    vscode.commands.registerCommand('Route.refreshEntry', function () { return apiProvider.refresh(); });
    vscode.window.registerTreeDataProvider('Route', apiProvider);
}
var ApiProvider = (function () {
    function ApiProvider(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    ApiProvider.prototype.refresh = function () {
        this._onDidChangeTreeData.fire();
    };
    ApiProvider.prototype.getChildren = function (element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No api.json in empty workspace');
            return Promise.resolve([]);
        }
        if (element) {
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
        var apiJSONPath = path.join(this.workspaceRoot, 'src', 'api.json');
        if (this.pathExists(apiJSONPath)) {
            return Promise.resolve(this.parseApiJSON(apiJSONPath));
        }
        else {
            vscode.window.showInformationMessage('Workspace has no api.json');
            return Promise.resolve([]);
        }
    };
    ApiProvider.prototype.getTreeItem = function (element) {
        return element;
    };
    ApiProvider.prototype.parseApiJSON = function (apiJSONPath) {
        var apiJSON = JSON.parse(fs.readFileSync(apiJSONPath, 'utf-8'));
        console.log(apiJSON);
        var list = [];
        for (var key in apiJSON) {
            list.push(new Api(key, apiJSON[key].method, apiJSON[key].path, apiJSON[key].protoPath, vscode.TreeItemCollapsibleState.Collapsed));
        }
        return list;
    };
    ApiProvider.prototype.pathExists = function (p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    };
    return ApiProvider;
}());
export { ApiProvider };
var Api = (function (_super) {
    __extends(Api, _super);
    function Api(label, methods, handlerPath, protoPath, collapsibleState, command) {
        var _this = _super.call(this, label, collapsibleState) || this;
        _this.label = label;
        _this.methods = methods;
        _this.handlerPath = handlerPath;
        _this.protoPath = protoPath;
        _this.collapsibleState = collapsibleState;
        _this.command = command;
        _this.iconPath = {
            light: path.join(__filename, '..', '..', 'media', 'api_light.svg'),
            dark: path.join(__filename, '..', '..', 'media', 'api_dark.svg')
        };
        _this.tooltip = _this.label;
        _this.description = _this.methods.join('|');
        return _this;
    }
    return Api;
}(vscode.TreeItem));
export { Api };
export function deactivate() { }
