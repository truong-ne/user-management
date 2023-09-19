import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { JwtModule } from "@nestjs/jwt";
import { SubUser } from "./entities/subUser.entity";
import { HealthStat } from "./entities/healthStat.entity";
@Module({
    imports: [
        TypeOrmModule.forFeature([User, SubUser, HealthStat])
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {

}