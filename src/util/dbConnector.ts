import mongoose from 'mongoose';

export default class DbConnector {
    private config;
    private isConnectedBefore;

    constructor(config) {
        this.config = config;
        this.isConnectedBefore = false;
        this.setDbEventHandlers();
        this.connect();
    }

    private connect() {
        try {
            mongoose.connect(this.config.db.connectionString, {auto_reconnect: true, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});
        } catch (error) {
            console.error('Connection Error: ', error);
        }
    }

    private setDbEventHandlers() {
        mongoose.connection.on('error', () => {
            console.error('Could not connect to MongoDB');
        });

        mongoose.connection.on(mongoose.STATES[0], () => {
            console.warn('Lost MongoDB connection...');
            if (!this.isConnectedBefore) {
                this.connect();
            }
        });
        mongoose.connection.on(mongoose.STATES[1], () => {
            this.isConnectedBefore = true;
            console.info('Connection established to MongoDB');
        });

        mongoose.connection.on('reconnected', () => {
            console.info('Reconnected to MongoDB');
        });
    }

}
