import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Token } from "./entities/token.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { UserMiddleware } from "./middleware/user.middleware";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { SubUser } from "./entities/subUser.entity";
import { HealthStat } from "./entities/healthStat.entity";

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
        }),
        TypeOrmModule.forFeature([User, Token, SubUser, HealthStat])
    ],
    controllers: [UserController],
    providers: [UserService, JwtStrategy],
    exports: [UserService]
})
export class UserModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserMiddleware)
        .forRoutes(UserController)
    }
}