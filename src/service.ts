import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { buildSchema, execute } from 'graphql'
import portfinder from 'portfinder'
import fsPromises from 'fs/promises'
import path from 'path'
import find from 'find-process'
import execa from 'execa'

const BASE_PORT = 8000
const MAX_PORT = 9999

const scalarTypes = ['AWSDateTime', 'AWSDate', 'AWSEmail','AWSURL', 'AWSPhone', 'AWSJSON', 'AWSTime']

const UNKNOWN_ERROR = 'Unknown error occurred during the execution of the Lambda function';

interface Options {
    schema: string
    config: string
}

interface LambdaResult {
    Response?: string
    Error?: string
  };

const service = async (options:Options) => {
    try {
    const [gql, port] = await Promise.all([
        fsPromises.readFile(options.schema)
        ,portfinder.getPortPromise({
            startPort: BASE_PORT,
            stopPort: MAX_PORT
        })
    ])

    const configModule = require(path.resolve(options.config))
    const subscriptionRegExp = /type Subscription \{(.|\n)*\}/ig
    const schema = buildSchema(`${scalarTypes.map(x => `scalar ${x}`).join('\n')}\n${gql.toString().replace(subscriptionRegExp,'')}`)

    

    const app = express()
    
    app.use('/graphql', graphqlHTTP({
        schema: schema,
        customExecuteFn: (request) => {
            if(request.operationName === 'IntrospectionQuery') {
                return execute(request)
            }
            const rootValue = request.document.definitions.reduce((acc, next:any) => {
                return {...acc, ...next.selectionSet.selections.reduce((acc, next) => {
                    const field = next.name.value
                    if(!(field in configModule)){
                        throw new Error(`Field: "${field}" not in config module`)
                    }
                    const fieldConfig = configModule[field]
                    return {...acc, ...{
                        [next.name.value]: async (args, request, field) => {
                            const {
                                functionName,
                                debugProcess,
                                payload
                            } = fieldConfig
                            
                            const finds = await find('name', debugProcess)
                            const found = finds.filter(x => x.cmd.includes(functionName))[0]
                            const { stdout } = await execa('netstat', ['-ltnp', found.pid.toString()]);
                            const pidRegex = new RegExp(found.pid.toString());
                            const stat = stdout.split('\n').filter(x => pidRegex.test(x))[0];
                            const debugProcessPort = stat.match(/127.0.0.1:([\d]{1,5})/);
                            const debugPort = parseInt(debugProcessPort[1], 10);
                            const processResult = await execa('./src/goInvoke/main', {
                                input: `${JSON.stringify({
                                    timeoutMilliseconds: 5000,
                                    port: debugPort,
                                    payload: `${JSON.stringify(await payload(args, request, field), null)}`
                                }, null)}\n`
                            })
                            if (processResult.exitCode === 0) {
                                const lambdaResult: LambdaResult = JSON.parse(processResult.stdout);
                            
                                if (lambdaResult.Response) {
                                  try {
                                    return JSON.parse(lambdaResult.Response);
                                  } catch {
                                    return lambdaResult.Response;
                                  }
                                } else {
                                  throw new Error(lambdaResult.Error || UNKNOWN_ERROR);
                                }
                              } else {
                                const errorMessage = processResult.stderr || UNKNOWN_ERROR;
                            
                                throw new Error(`Lambda invoker exit code: ${processResult.exitCode}, message: ${errorMessage}`);
                              }
                        }
                    }}
                },{})}
            }, {})
            return execute({...request, rootValue})
        },
        graphiql: true,
        }))

        app.listen(port);
        return `Running a GraphQL API server at http://localhost:${port}/graphql`
    
    } catch (e) {
        console.log(e)
        throw e
    }
}

export default service