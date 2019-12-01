const healthSchema = {
    schema: {
        description: 'This is the health end point ',
        tags: ['health'],
        response: {
            200: {
                description: 'Health response',
                type: 'object',
                properties: {
                    success: {type: 'string'}
                }
            },
            500: {
                description: 'Health Fails',
                type: 'object',
                properties: {
                    statusCode: {type: 'number'},
                    error: {type: 'string'},
                    message: {type: 'string'}
                }
            }

        }
    }
};
export default healthSchema;