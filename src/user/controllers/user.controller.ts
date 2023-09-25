import { Body, Controller, Param, Get, Post, UseGuards, Req, Patch } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { SignUpDto } from "../dtos/sign-up.dto";
import { UpdateProfile } from "../dtos/update-profile.dto";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @Post()
    async signup(@Body() dto: SignUpDto): Promise<any> {
        return await this.userService.signup(dto)
    }

    @UseGuards(JwtGuard)
    @Patch()
    async updateUser(@Req() req, @Body() dto: UpdateProfile): Promise<any> {
        return await this.userService.updateUser(dto, req.user.id)
    }
}