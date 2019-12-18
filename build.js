const fse = require('fs-extra');
const { resolve } = require('path');
const {promisify} = require('util');
const matter = require("gray-matter");
const Article = require('./src/article');
const ejsRenderFile = promisify(require('ejs').renderFile);
// const globP = promisify(require('glob'));
const config = require('./config')
const contentPath = './content'
const distPath = './public'
const assetsPath = './assets'
const layoutPath = './layout'
const arguments = process.argv;


const length = arguments.length;
if(length < 3) {
    console.log("node build.js generate");
    return;
}
const command = arguments[2];

/**
 * generate static files
 *
 */
if(command === "generate") {
    parse(contentPath)
        .then((articles) => generate(articles))
        .then(() => console.log("done"))
        .catch(err => console.error(err));
    return;
}
if(length >= 4 && command === "new") {
    let newContent = arguments[3];
    createNew(newContent);
}




function createNew(newContent){
    const array = newContent.split("/")
    const title = array[array.length - 1].split(".")[0].split("-").join(" ")
    const date = new Date().toISOString();
    fse.outputFile(resolve(contentPath, newContent), matter.stringify("hello world", {title, date}));
}



// /**
//  * generate home page
//  */
// ejsRenderFile(`${layoutPath}/index.ejs`, {...config})
//     .then((str) => fse.outputFile(`${distPath}/index.html`, str))
//     .then(() => console.log("write succeed"))
//     .catch(err => console.error(err));
/**
 *
 * @param contentPath
 * @returns {Promise<any[]>}
 */
async function parse(contentPath) {
    const types = await fse.readdir(contentPath);
    const contents = await Promise.all(types.map(async (type) => {
        const files = await fse.readdir(`${contentPath}/${type}`);
        const result = await Promise.all(files.map(async(file) => {
            const res = resolve(contentPath, type, file);
            const raw = await fse.readFile(res,  "utf8");
            const matttered = matter(raw);
            return new Article(file, matttered.data,
                                matttered.content,
                                type);
        }))
        return result;
    }))
    return contents.flat();
}

/**
 *
 * @param articles Article[]
 * @returns {Promise<number[]>}
 */
async function generate(articles) {
    await fse.emptyDirSync(distPath);
    await fse.copy(assetsPath, distPath)
    const p = await Promise.all(articles.map(async (article) => {
        const dir = resolve(distPath, article.type);
        await fse.ensureDir(dir);
        const outputFile = resolve(dir, article.getHTMLFileName());
        const rendered = await ejsRenderFile(`${layoutPath}/single.ejs`,
            {...config, meta: article.meta, body: article.getTufteMarked()})
        await fse.outputFile(outputFile, rendered);
        console.log("generated: ", outputFile);
    }))
    const articleList = articles.map((article) => {
        return {link: article.type+"/" + article.getHTMLFileName(), meta: article.meta}
    })
    const rendered = await ejsRenderFile(`${layoutPath}/index.ejs`, {...config, articleList});
    await fse.outputFile(`${distPath}/index.html`, rendered);
}


// async function generateIndex(articles) {
//     const articleList = articles.map((article) => {
//         return {link: resolve(article.type, article.getHTMLFileName()), meta: article.meta}
//     })
//     const rendered = await ejsRenderFile(`${layoutPath}/index.ejs`, {articleList});
//     const res = fse.outputFile(`${distPath}/index.html`, rendered);
//     return res;
// }

