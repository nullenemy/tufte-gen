const configurePaser = require('@tufte-markdown/parser');
const options = {
    react: false,
}
const parseMarkdown = configurePaser(options);

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

module.exports = Article;
