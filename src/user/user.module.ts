import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Token } from "./entities/token.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { UserMiddleware } from "./middleware/user.middleware";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Token])
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserMiddleware)
        .forRoutes(UserController)
    }
}