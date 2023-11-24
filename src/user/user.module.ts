import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { MedicalRecord } from "./entities/medical-record.entity";
import { MedicalRecordController } from "./controllers/medical-record.controller";
import { MedicalRecordService } from "./services/medical-record.service";
import { UserConsumer } from "./consumers/user.consumer";
import * as dotenv from 'dotenv'

dotenv.config()

@Module({
    imports: [
        TypeOrmModule.forFeature([User, MedicalRecord]),
    ],
    controllers: [UserController, MedicalRecordController],
    providers: [UserService, MedicalRecordService],
})
export class UserModule {

}