module.exports = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  migrations: ['src/data/typeorm/migrations/*.ts'],
  entities: ['src/data/typeorm/entities/*.ts'],
  synchronize: false,
  cli: {
    migrationsDir: 'src/data/typeorm/migrations',
  },
  logging: process.env.DATABASE_LOGGING === 'true',
};
