const fse = require('fs-extra');
const { resolve } = require('path');
const YAML = require('yaml');
const matter = require("gray-matter");

const {promisify} = require('util');
const Article = require('./article')
const ejsRenderFile = promisify(require('ejs').renderFile);

const assetsPath = "./assets";
const contentPath = "./content";
const distPath = "./public";
const layoutPath = "./layout";
const configYAML = "./_config.yml";


async function getConfig() {
    const yaml = await fse.readFile(configYAML, "utf8");
    const config = YAML.parse(yaml);
    return config;
}



/**
 *
 * @param contentPath
 * @returns {Promise<any[]>}
 */
async function parse() {
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
async function generate() {
    await fse.emptyDirSync(distPath);
    await fse.copy(assetsPath, distPath)
    const config = await getConfig();
    const articles = await parse();
    await Promise.all(articles.map(async (article) => {
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
    console.log("generated: ", `${distPath}/index.html`);
}

module.exports = generate;
