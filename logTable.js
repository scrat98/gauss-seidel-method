const Table = require("cli-table");
const colors = require("colors/safe");
const _merge = require("lodash/merge");

const defaultOptions = {
  title: "",
  text: "",
  tableOptions: {
    style: {
      head: ["blue"]
    }
  },
  colors: {
    default: "white",
    title: "cyan",
    text: "white",
    ok: ["green", "bgBlack"],
    warn: ["grey", "bgYellow"],
    error: ["red", "bgBlack"]
  }
};

class LogTable {
  constructor(options) {
    this.options = _merge({}, defaultOptions, options);
    this.error = { code: "", msg: "" };
    this.data = [];
    colors.setTheme(this.options.colors);
  }

  push(line) {
    this.data.push(line);
  }

  setError(code, msg, color = "default") {
    this.error = { code: code, msg: msg, color: color };
  }

  toString() {
    const { title, text, tableOptions } = this.options;
    const { error, data } = this;
    const table = (() => {
      const table = new Table(tableOptions);
      data.forEach(el => table.push(el));
      return table.toString();
    })();

    let result = "\n";
    if (title.length != 0) result += `${colors.title(title)}\n`;
    if (text.length != 0) result += `${colors.text(text)}\n`;
    if (table.length != 0) result += `${table}\n`;
    if (error.code.length != 0) {
      const errorStr = `code: ${error.code} | msg: ${error.msg}`;
      result += colors[error.color](errorStr);
    }
    result += "\n";

    return result;
  }
}

module.exports = LogTable;
