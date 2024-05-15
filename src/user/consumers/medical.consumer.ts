import { Injectable } from "@nestjs/common";
import { MedicalRecordService } from "../services/medical-record.service";
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq";

@Injectable()
export class MedicalConsumer {
    constructor(
        private readonly medicalRecordService: MedicalRecordService,
    ) { }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'range_age', 
        queue: 'range_age',
    })
    async rangeAge(ids: string[], year: number): Promise<any> {
        return await this.medicalRecordService.rangeAge(ids, year)
    }
}