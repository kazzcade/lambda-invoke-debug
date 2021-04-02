module.exports = {
    GetAccount:{
        payload: (args, request, field) => ({
            typeName: field.operation.operation,
            fieldName: field.fieldName,
            arguments: JSON.stringify(args, null)
        }),
        debugProcess: '__debug_bin',
        functionName: 'echo'
    }
}