import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { MedicalRecord } from "./entities/medicalRecord.entity";
import { MedicalRecordController } from "./controllers/medicalRecord.controller";
import { MedicalRecordService } from "./services/medicalRecord.service";
@Module({
    imports: [
        TypeOrmModule.forFeature([User, MedicalRecord])
    ],
    controllers: [UserController, MedicalRecordController],
    providers: [UserService, MedicalRecordService],
})
export class UserModule {

}