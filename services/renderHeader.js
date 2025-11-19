const ejs = require("ejs");

function renderHeader() {
    return ejs.renderFile("./views/header.ejs");
}

module.exports = renderHeader