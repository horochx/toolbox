#!/usr/bin/env node
import clear from 'clear'
import figlet from 'figlet'
import chalk from 'chalk'
import commander from 'commander'

import { swagger2ts } from './swagger2ts'

const pkg = require('../package.json')

const program = new commander.Command()

clear()

console.log(
  chalk.cyan(
    figlet.textSync(pkg.name, {
      horizontalLayout: 'full',
    })
  )
)

program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .version(pkg.version)
  .description(pkg.description)

program
  .command('init [appName]')
  .description('init webpack project')
  .action((appName: string) => {
    console.log(`This feature is work in process.`)
  })

program
  .command('swagger2ts')
  .description('convert swagger to typescript')
  .requiredOption('-s --source <uri>', 'swagger.json file path or url')
  .option('-o --outDir <dirPath>', 'directory where typescript will be output')
  .action(({ source, outDir = 'swagger2tsOutDir' }: Record<string, string>) => {
    swagger2ts(source, outDir)
  })

program.parse(process.argv)
