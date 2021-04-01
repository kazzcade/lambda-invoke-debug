#!/usr/bin/env node

import yargs, {Arguments} from 'yargs'
import {hideBin} from 'yargs/helpers'
import service from './service'

type Args = Arguments<{
    schema: string
    config: string
}>

const BASE_PORT = 8000
const MAX_PORT = 9999

yargs(hideBin(process.argv))
.command('serve <schema> <config>', 'start server', yargs => {
    return yargs
    .positional('schema', {
        describe: 'Path to a graphql schema'
    })
    .positional('config', {
        describe: 'Path to a config file for mapping graphql requests to functions'
    })
}, async ({schema, config} : Args) => {
    console.log(await service({
        schema,
        config
    }))
})
.argv
