import { Injectable } from '@nestjs/common';
import { BaseService } from '../../config/base.service';
import { Transaction } from '../entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as CryptoJS from 'crypto-js'
import { TransactionDto } from '../dto/transaction.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class TransactionService extends BaseService<Transaction> {
    constructor(
        @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {
        super(transactionRepository)
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    private async checkCashIn() {
        const transactions = await this.transactionRepository.find({ where: { isPaid: false }, relations: ['user'] })
        for (const transaction of transactions) {
            // signature Momo
            let signature = "accessKey=" + 'klm05TvNBzhg7h7j' + "&orderId=" + transaction.orderId +
                "&partnerCode=" + 'MOMOBKUN20180529' + "&requestId=" + transaction.requestId
            const hash = await CryptoJS.HmacSHA256(signature, 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa');
            signature = CryptoJS.enc.Hex.stringify(hash)
            // initial req
            const req = {
                "partnerCode": "MOMOBKUN20180529",
                "orderId": transaction.orderId,
                "requestId": transaction.requestId,
                "lang": "vi",
                "signature": signature
            }
            // check status isPaid transaction
            const momoQuery = await fetch('https://test-payment.momo.vn/v2/gateway/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req)
            })
            // 
            const data = await momoQuery.json()
            // if momo payment qrcode paid
            if (data.message === "Thành công.") {
                await this.transactionRepository.update({ id: transaction.id }, {
                    isPaid: true
                })
                const user = await this.userRepository.findOneBy({ id: transaction.user.id })
                await this.userRepository.update({ id: transaction.user.id }, {
                    account_balance: user.account_balance + transaction.amount
                })
            }
        }
    }
    //User Payment
    async HealthlinePaymentCashOut(userId: string, amount: number) {
        const user = await this.userRepository.findOneBy({ id: userId })

        const date = new Date().getTime();
        const requestId = date + "healthline";
        const orderId = date + ":healthline";
        const transaction = this.transactionRepository.create({
            amount: amount,
            orderId: orderId,
            requestId: requestId,
            user: user,
            typePaid: false,
            isPaid: true
        })

        // save transaction
        await this.transactionRepository.save(transaction)

        await this.userRepository.update({ id: userId }, {
            account_balance: user.account_balance - transaction.amount
        })
        
        return {
            code: 200,
            message: 'success'
        }
    }

    async HealthlinePaymentCashIn(userId: string, amount: number) {
        const user = await this.userRepository.findOneBy({ id: userId })

        const cashIn = await this.paymentMomo(amount.toString())
        const transaction = this.transactionRepository.create({
            amount: amount,
            orderId: cashIn.orderId,
            requestId: cashIn.requestId,
            user: user
        })
        // save transaction
        await this.transactionRepository.save(transaction)
        return cashIn
    }

    async UserTransactionHistory(userId: string) {
        const transactions = await this.transactionRepository.find({ where: { user: { id: userId } }, relations: ['user'] })

        return {
            code: 200,
            message: 'success',
            data: transactions
        }
    }

    //Doctor Payment
    async DoctorPaymentCashOut(doctor: string, amount: number) {
        const date = new Date().getTime();
        const requestId = date + "healthline";
        const orderId = date + ":healthline";
        const transaction = this.transactionRepository.create({
            amount: amount,
            orderId: orderId,
            requestId: requestId,
            doctor: doctor,
            typePaid: false,
            isPaid: true
        })

        // save transaction
        await this.transactionRepository.save(transaction)
        
        return {
            doctor: doctor,
            amount: amount
        }
    }

    async DoctorTransactionHistory(doctorId: string) {
        const transactions = await this.transactionRepository.find({ where: { doctor: doctorId } })

        return transactions
    }

    private async paymentMomo(amount: string): Promise<any> {
        const date = new Date().getTime();
        const requestId = date + "healthline";
        const orderId = date + ":healthline";
        const autoCapture = true;
        const requestType = "captureWallet";
        const notifyUrl = "https://sangle.free.beeceptor.com";
        const returnUrl = "https://sangle.free.beeceptor.com";
        // const amount = "10000";
        const orderInfo = "Thanh toán qua Website";
        const extraData = "ew0KImVtYWlsIjogImh1b25neGRAZ21haWwuY29tIg0KfQ==";
        let signature = "accessKey=" + 'klm05TvNBzhg7h7j' + "&amount=" + amount +
            "&extraData=" + extraData + "&ipnUrl=" + notifyUrl + "&orderId=" + orderId +
            "&orderInfo=" + orderInfo + "&partnerCode=" + 'MOMOBKUN20180529' + "&redirectUrl=" +
            returnUrl + "&requestId=" + requestId + "&requestType=" + requestType;
        const hash = await CryptoJS.HmacSHA256(signature, 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa');
        signature = CryptoJS.enc.Hex.stringify(hash)


        const req = {
            "partnerCode": "MOMOBKUN20180529",
            "partnerName": "Test",
            "storeId": "MOMOBKUN20180529",
            "requestType": "captureWallet",
            "ipnUrl": "https://sangle.free.beeceptor.com",
            "redirectUrl": "https://sangle.free.beeceptor.com",
            "orderId": orderId,
            "amount": amount,
            "lang": "vi",
            "autoCapture": true,
            "orderInfo": "Thanh toán qua Website",
            "requestId": requestId,
            "extraData": extraData,
            "signature": signature
        }

        const data = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        })
        // console.log(await data.json())
        return await data.json()
    }
}