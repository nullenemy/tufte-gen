const fse = require('fs-extra');
const { resolve } = require('path');
const matter = require("gray-matter");
const contentPath = './content'
/**
 * 
 * @param {string} contentPath 
 * @param {string} postPath in the format of [type]/filename.md (eg. posts/hello-world.md)
 */


async function create(postPath){
    const array = postPath.split("/")
    const title = array[array.length - 1].split(".")[0].split("-").join(" ")
    const date = new Date().toISOString();
    await fse.outputFile(resolve(contentPath, postPath), 
        matter.stringify("hello world", {title, date}));
    console.log("created ", resolve(contentPath, postPath));
}

module.exports = create;