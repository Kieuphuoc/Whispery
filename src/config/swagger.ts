import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Whispery API',
            version: '1.0.0',
            description: 'Voice Pin social media API'
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    // Include both TS (dev) and JS (prod/Docker) paths for swagger-jsdoc to find annotations
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
        './dist/routes/*.js',
        './dist/controllers/*.js'
    ]
};

export const swaggerSpec = swaggerJsdoc(options);
