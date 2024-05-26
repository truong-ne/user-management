import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresOption, redisClientOption } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { dataSourceOptions } from '../db/data-source';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      ...redisClientOption
    }),
    UserModule,
    AuthModule,
    TransactionModule
  ],
})
export class AppModule { }
