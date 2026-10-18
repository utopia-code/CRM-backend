import { config } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

config({
  path: `.env.${process.env.NODE_ENV || 'local'}`,
});

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  schema: 'public',
  ssl: process.env.NODE_ENV !== 'local' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  migrations: [__dirname + '/migrations/*.ts'],
  connectTimeoutMS: 10000,
  logging: ['error', 'query'],
});
