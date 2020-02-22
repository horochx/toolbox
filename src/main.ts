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
    figlet.textSync(Object.keys(pkg.bin)[0], {
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
  .description('Init webpack.')
  .action((appName: string) => {
    console.log(`appName is: ${appName}`)
  })

program
  .command('swagger2ts')
  .description('Converting swagger to typescript.')
  .option('-s --source <uri>', 'swagger.json file path or url')
  .option('-t --target <filePath>', 'typescript file path')
  .action(({ source, target = 'types' }: Record<string, string>) => {
    swagger2ts(source, target)
  })

program.parse(process.argv)
