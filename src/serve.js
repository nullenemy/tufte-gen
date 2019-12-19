const express = require("express");
const app = express();
const chokidar = require('chokidar');
const generate = require('./generate')

app.use(express.static("public"));

function serve(port) {
    chokidar.watch(["assets", "content", "layout"])
        .on("change", async (event, path) => {
        console.log("file changed, generating again")
        await generate();
        console.log("done");
    })

    app.listen(port, () => {
        console.log("server running at localhost:", port);
    })
}

module.exports = serve;