import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { MedicalRecord } from "./entities/medical-record.entity";
import { MedicalRecordController } from "./controllers/medical-record.controller";
import { MedicalRecordService } from "./services/medical-record.service";
import * as dotenv from 'dotenv'
import { ScheduleModule } from "@nestjs/schedule";
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MedicalConsumer } from "./consumers/medical.consumer";

dotenv.config()

@Module({
    imports: [
        RabbitMQModule.forRoot(RabbitMQModule, {
            exchanges: [
                {
                    name: 'healthline.user.information',
                    type: 'direct'
                },
                {
                    name: 'healthline.doctor.information',
                    type: 'direct'
                }
            ],
            uri: process.env.RABBITMQ_URL,
            connectionInitOptions: { wait: false, reject: true, timeout: 10000 },
            enableControllerDiscovery: true
        }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([User, MedicalRecord]),
    ],
    controllers: [UserController, MedicalRecordController],
    providers: [UserService, MedicalRecordService, MedicalConsumer],
})
export class UserModule {

}