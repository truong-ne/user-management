import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv'
import { UserService } from 'src/user/services/user.service';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SERVICE
        })
    ],
    providers: [
        JwtStrategy,
        UserService
    ]
})
export class AuthModule { }
