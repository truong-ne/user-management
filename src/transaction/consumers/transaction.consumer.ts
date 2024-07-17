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

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'pending_transaction', 
        queue: 'pending_transaction',
    })
    async UserOrderConsultation(payload: any): Promise<any> {
        return await this.transactionService.UserOrderConsultation(payload.userId, payload.doctor, payload.amount)
    }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'denied_transaction', 
        queue: 'denied_transaction',
    })
    async DoctorDeniedConsultation(payload: any): Promise<any> {
        return await this.transactionService.DoctorDeniedConsultation(payload.userId, payload.doctor, payload.amount)
    }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'cancel_transaction', 
        queue: 'cancel_transaction',
    })
    async UserCancelConsultation(payload: any): Promise<any> {
        return await this.transactionService.UserCancelConsultation(payload.userId, payload.doctor, payload.amount)
    }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'cancel_confirm_transaction', 
        queue: 'cancel_confirm_transaction',
    })
    async UserCancelConfirmConsultation(payload: any): Promise<any> {
        return await this.transactionService.UserCancelConfirmConsultation(payload.userId, payload.doctor, payload.amount)
    }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'finished_transaction', 
        queue: 'finished_transaction',
    })
    async DoctorFinishedConsultation(payload: any): Promise<any> {
        return await this.transactionService.DoctorFinishedConsultation(payload.doctorId, payload.user, payload.amount)
    }
}