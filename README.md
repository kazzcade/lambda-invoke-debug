# lambda-invoke-debug
Invoke a locally running lambda function while debugging.

# Credit
This project takes inspiration from [Amplify CLI](https://docs.amplify.aws/cli) specifically the mocking functionality and how it invokes a local lambda function.
# Purpose
The purpose of this project is to serve a graphql schema and relay the requests to a locally running lambda function for the purpose of debugging.

# Supported lambda runtime Go
## go

# Dependencies
## Go
## Node

# Install
`npm install lambda-invoke-debug`

# Local install
1. Clone the repo
2. npm install
3. (optional) npm link will add `lid` command to your cli or within the project run `npm run start`

# Usage
Run `lid serve <graphql schema file> <config file>`

## Example
`lid serve ~/project/schema.graphql ~/project/config.js` 

## Config
The config file is a javascript module that is loaded dynamically at runtime. This file should look like
```js
module.exports = {
    /*
        type Query {
            GetAccount(input: AccountGetInput!): Account
        }
    */
   // the name of the field in the schema
    GetAccount : {
        // the name of the process running your code
        // for go debug process we use
        debugProcess: '__debug_bin',
        // a distinctive name in the file path to your code
        // example ~/projects/myGraph/backend/functions/Account/src/main.go
        // 'Account' is in the path and unique name that I can use to identify this function for my field
        functionName: 'Account',
        // the payload you want to mock and send to your function
        // you can also return a promise
        payload: (args, request, field) => ({
            typeName: field.operation.operation,
            fieldName: field.fieldName,
            arguments: JSON.stringify(args, null)
        })
    }
}
```



