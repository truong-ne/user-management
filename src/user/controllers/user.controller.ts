import { Body, Controller, Param, Get, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtGuard } from "../../auth/guards/jwt.guard";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @UseGuards(JwtGuard)
    @Get(':id')
    async signup(@Param('id') id: string): Promise<any> {
        return await this.userService.getUserById(id)
    }
}