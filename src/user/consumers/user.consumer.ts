import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager";
import { RabbitPayload, RabbitRPC } from "@golevelup/nestjs-rabbitmq"
import { MedicalRecordService } from "../services/medical-record.service";

@Injectable()
export class UserConsumer {
    constructor(
        private readonly MedicalRecordService: MedicalRecordService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'user',
        queue: 'user',
    })
    async createPatientRecord(@RabbitPayload() uids: string[]): Promise<any> {
        return this.MedicalRecordService.findAllMainRecord(uids)
    }
}