const program = require('commander');
const YAML = require('yaml');
const create = require('./create');
const generate = require('./generate');
const init = require('./init');
const serve = require('./serve');



program
    .command('new <postPath>')
    .action(async (postPath) => {
        await create(postPath);
    });
program
    .command('generate')
    .action(async () => {
        await generate();
    });
program
    .command('init <folder>')
    .action(async (folder) => {
        await init("./" + folder);
    });
program
    .command('serve <port>')
    .action((port) => {
        serve(port);
    })

program.parse(process.argv);
