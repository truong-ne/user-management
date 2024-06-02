import { Injectable } from "@nestjs/common";
import { TransactionService } from "../services/transaction.service";
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq";

@Injectable()
export class TransactionConsumer {
    constructor(
        private readonly transactionService: TransactionService,
    ) { }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'doctor_cash_out', 
        queue: 'doctor_cash_out',
    })
    async DoctorPaymentCashOut(payload: any): Promise<any> {
        return await this.transactionService.DoctorPaymentCashOut(payload.doctor, payload.amount)
    }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'doctor_transaction', 
        queue: 'doctor_transaction',
    })
    async DoctorTransactionHistory(payload: any): Promise<any> {
        return await this.transactionService.DoctorTransactionHistory(payload.doctor)
    }
}