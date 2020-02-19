#!/usr/bin/env node
import clear from 'clear'
import figlet from 'figlet'
import chalk from 'chalk'
import commander from 'commander'

const pkg = require('../package.json')

const program = new commander.Command()

clear()

console.log(
  chalk.cyan(
    figlet.textSync(Object.keys(pkg.bin)[0], {
      horizontalLayout: 'full',
    }),
  ),
)

program
  .version(pkg.version)
  .description(pkg.description)
  .command('init [appName]')
  .parse(process.argv)
