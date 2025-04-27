#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { startServer } = require('../lib/server');

program
  .name('surfer')
  .description('Quick Fastify servers for toy applications')
  .version('0.1.0');

program
  .command('start <app-type>')
  .description('Start a toy application server')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .action(async (appType, options) => {
    try {
      const appTypes = ['todolist', 'notes', 'counter'];
      
      if (!appTypes.includes(appType)) {
        console.error(chalk.red(`Error: App type must be one of: ${appTypes.join(', ')}`));
        process.exit(1);
      }

      console.log(chalk.blue(`Starting ${appType} server on port ${options.port}...`));
      await startServer(appType, parseInt(options.port));
    } catch (error) {
      console.error(chalk.red('Error starting server:', error.message));
      process.exit(1);
    }
  });

program.parse(process.argv); 