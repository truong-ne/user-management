import { Body, Controller, Param, Get } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @ApiBearerAuth()
    @Get(':id')
    async signup(@Param('id') id: string): Promise<any> {

        return await this.userService.getUserById(id)
    }
}