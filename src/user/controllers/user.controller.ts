import { Body, Controller, Param, Get } from "@nestjs/common";
import { UserService } from "../services/user.service";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @Get(':id')
    async signup(@Param('id') id: string): Promise<any> {
        return await this.userService.getUserById(id)
    }
}