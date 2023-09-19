import { Body, Controller, Param, Get, Post, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { SignUpDto } from "../dtos/sign-up.dto";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @Post()
    async signup(@Body() dto: SignUpDto): Promise<any> {
        return await this.userService.signup(dto)
    }
}