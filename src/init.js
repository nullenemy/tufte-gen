const fse = require('fs-extra');
const {resolve} = require('path');
const resource = resolve(__dirname, "../resource");

async function init(workingPath) {
    await fse.copy(resource, workingPath);
    console.log("Initilized " + workingPath);
}
// const assetsPath = resolve(resource, "assets");
// async function init(sitePath) {
//     await fse.ensureDir(resolve(sitePath, ));
// }

module.exports = init;