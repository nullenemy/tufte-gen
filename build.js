const fse = require('fs-extra');
const { resolve } = require('path');
const {promisify} = require('util');
const matter = require("gray-matter");
const marked = require('marked');
const configurePaser = require('@tufte-markdown/parser');

const ejsRenderFile = promisify(require('ejs').renderFile);
// const globP = promisify(require('glob'));
const options = {
    react: false,
}

const parseMarkdown = configurePaser(options);

const config = require('./config')

const contentPath = './content'
const distPath = './public'
const assetsPath = './assets'
const layoutPath = './layout'

/**
 * Class representing a article (post)
 */
class Article {
    /**
     *
     * @param meta {object} - data for frontmatter
     * @param content {string} - raw markdown content
     * @param type {string} - content type and folder name for the articles
     */
    constructor(filename, meta, content, type) {
        this.filename = filename;
        this.meta = meta;
        this.content = content;
        this.type = type;
    }
    getMarked() {
        return marked(this.content);
    }

    getHTMLFileName(){
        return this.filename.split(".")[0] + ".html";
    }

    getTufteMarked() {
        return parseMarkdown(this.content);
    }
}

fse.emptyDirSync(distPath);

/**
 * copy assets folder.
 * todo: need to put this in a theme
 */

fse.copy(assetsPath, distPath)
    .then(() => console.log('success!'))
    .catch(err => console.error(err));

/**
 * generate home page
 */
ejsRenderFile(`${layoutPath}/index.ejs`, {...config})
    .then((str) => fse.outputFile(`${distPath}/index.html`, str))
    .then(() => console.log("write succeed"))
    .catch(err => console.error(err));

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
    const p = await Promise.all(articles.map(async (article) => {
        const dir = resolve(distPath, article.type);
        await fse.ensureDir(dir);
        const outputFile = resolve(dir, article.getHTMLFileName());
        const rendered = await ejsRenderFile(`${layoutPath}/single.ejs`,
            {...config, meta: article.meta, body: article.getTufteMarked()})
        await fse.outputFile(outputFile, rendered);
        console.log("generated: ", outputFile);
    }))
    return p;
}


parse(contentPath)
    .then((articles) => generate(articles))
    .then(() => console.log("done"))
    .catch(err => console.error(err));
