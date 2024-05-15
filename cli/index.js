import select from '@inquirer/select'
import { program } from 'commander'
import path from 'path'
import { fileURLToPath } from 'url'

import fetchComics from './commands/fetchComics.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const __siteroot = __dirname.replace('/cli', '');

const runWizard = async () => {
    const type = await select({
        message: 'What do you want to do?',
        choices: [
            {
                name: 'Fetch comic collection',
                value: 'comic',
                description: 'Fetch comic collection',
            },
        ],
    })

    switch (type) {
        case 'comic':
            fetchComics(__siteroot)
            break
    }
}

program
    .command('run')
    .description('🧙‍♂️ run the site wizard')
    .action(() => runWizard())

program
    .command('comics')
    .description('🧱 Fetch comic collection')
    .action(() => fetchComics(__siteroot))

program.parse()