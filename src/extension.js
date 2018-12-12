const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let configFilePath,
  jsHintConfigFile,
  esLintConfigFile,
  configProperties = {};

function GetConfigFile() {
  if (vscode.workspace.workspaceFolders == null) {
    vscode.window.showErrorMessage('You have not yet opened a folder.');
    return false;
  } else {
    jsHintConfigFile = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.jshintrc');
    esLintConfigFile = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.eslintrc.json');
    return true;
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('atg.true', () => {
      if (!GetConfigFile()) return;

      if (fs.existsSync(jsHintConfigFile)) configFilePath = jsHintConfigFile;
      else if (fs.existsSync(esLintConfigFile)) configFilePath = esLintConfigFile;
      else {
        vscode.window.showErrorMessage("We couldn't find a JSHint/ESLint config file in your project root.");
        return;
      }

      fs.readFile(configFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        if (data.length > 1) configProperties = JSON.parse(data);

        AddGlobalVariable();
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('atg.false', () => {
      if (!GetConfigFile()) return;

      if (fs.existsSync(jsHintConfigFile)) configFilePath = jsHintConfigFile;
      else if (fs.existsSync(esLintConfigFile)) configFilePath = esLintConfigFile;
      else {
        vscode.window.showErrorMessage("We couldn't find a JSHint/ESLint config file in your project root.");
        return;
      }

      fs.readFile(configFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        if (data.length > 1) configProperties = JSON.parse(data);

        AddGlobalVariable(false);
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('atg.remove', () => {
      if (!GetConfigFile()) return;

      if (fs.existsSync(jsHintConfigFile)) configFilePath = jsHintConfigFile;
      else if (fs.existsSync(esLintConfigFile)) configFilePath = esLintConfigFile;
      else {
        vscode.window.showErrorMessage("We couldn't find a JSHint/ESLint config file in your project root.");
        return;
      }

      fs.readFile(configFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        if (data.length > 1) configProperties = JSON.parse(data);

        RemoveGlobalVariable();
      });
    })
  );
}
exports.activate = activate;

function AddGlobalVariable(bool = true) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No editor open');
    return; // No open text editor
  }

  let selection = editor.selection;
  let text = editor.document.getText(selection);

  if (text.length === 0) {
    vscode.window.showErrorMessage('No text selected.');
    return;
  }
  if (configProperties.globals == null) {
    configProperties.globals = {};
  }

  configProperties.globals[text] = bool;

  fs.writeFile(configFilePath, JSON.stringify(configProperties, null, 2), 'utf-8', err => {
    if (err) vscode.window.showErrorMessage('Error Saving File.');
    else vscode.window.setStatusBarMessage(`'${text}' added to globals.`, 3000);
  });
}

function RemoveGlobalVariable() {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No editor open.');
    return; // No open text editor
  }

  let selection = editor.selection;
  let text = editor.document.getText(selection);

  if (text.length === 0) {
    vscode.window.showErrorMessage('No text selected.');
    return;
  }

  if (configProperties == null || configProperties.globals == null || configProperties.globals[text] == null) {
    vscode.window.showErrorMessage('Property does not exist.');
    return;
  }

  delete configProperties.globals[text];

  fs.writeFile(configFilePath, JSON.stringify(configProperties, null, 2), 'utf-8', err => {
    if (err) vscode.window.showErrorMessage('Error Saving File.');
    else vscode.window.setStatusBarMessage(`'${text}' removed from globals.`, 3000);
  });
}
