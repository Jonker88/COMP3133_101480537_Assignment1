const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

// Load environment variables
dotenv.config();

// Import modules
const connectDB = require('./config/db');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { authenticate } = require('./middleware/auth');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const startServer = async () => {
    // Connect to MongoDB
    await connectDB();

    // Create Express app
    const app = express();

    // Create Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        formatError: (error) => {
            return {
                message: error.message,
                path: error.path,
                extensions: {
                    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
                },
            };
        },
    });

    // Start Apollo Server
    await server.start();

    // Apply global middleware
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));

    // Root route - API info landing page
    app.get('/', (req, res) => {
        res.json({
            message: 'Employee Management System - COMP3133 Assignment 1',
            version: '1.0.0',
            endpoints: {
                graphql: '/graphql'
            },
            student_id: '101480537'
        });
    });

    // Apply Apollo GraphQL middleware
    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                const user = authenticate(req);
                return { user };
            },
        })
    );

    // Start Express server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`📊 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
