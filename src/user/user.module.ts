import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { MedicalRecord } from "./entities/medical-record.entity";
import { MedicalRecordController } from "./controllers/medical-record.controller";
import { MedicalRecordService } from "./services/medical-record.service";
import { UserConsumer } from "./consumers/user.consumer";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import * as dotenv from 'dotenv'

dotenv.config()

@Module({
    imports: [
        TypeOrmModule.forFeature([User, MedicalRecord]),
        RabbitMQModule.forRoot(RabbitMQModule, {
            exchanges: [
                {
                    name: 'healthline.user.information',
                    type: 'direct'
                }
            ],
            uri: process.env.RABBITMQ_URL,
            connectionInitOptions: { wait: false, reject: true, timeout: 10000 },
            enableControllerDiscovery: true
        }),
    ],
    controllers: [UserController, MedicalRecordController],
    providers: [UserService, MedicalRecordService, UserConsumer],
})
export class UserModule {

}