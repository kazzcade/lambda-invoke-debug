module.exports = {
    echo:{
        payload: (args, request, field) => ({
            typeName: field.operation.operation,
            fieldName: field.fieldName,
            arguments: args
        }),
        debugProcess: '__debug_bin',
        functionName: 'echo'
    }
}