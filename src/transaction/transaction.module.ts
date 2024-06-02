import { Module } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from '../user/entities/user.entity';
import { TransactionConsumer } from './consumers/transaction.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User]),
    ScheduleModule.forRoot()
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionConsumer],
})
export class TransactionModule { }
