// config/dbConfig.js
import { DataSource } from 'typeorm';
import { migrations, Entities } from '@veramo/data-store';

const DATABASE_FILE = 'database.sqlite';

const dbConnection = new DataSource({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
});

export default dbConnection;
