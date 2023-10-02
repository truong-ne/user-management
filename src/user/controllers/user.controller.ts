import { Body, Controller, Param, Get, Post, UseGuards, Req, Patch } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { SignUpDto } from "../dtos/sign-up.dto";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender, Relationship } from "../../config/enum.constants";

@ApiTags('User')

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @ApiOperation({ summary: 'Đăng ký dành cho người dùng', description: 'Đăng ký thành công sẽ tạo người dùng mới' })
    @ApiParam({ name: 'gender', enum: Gender, required: false })
    @ApiResponse({ status: 201, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Sai thông tin đăng ký của người dùng' })
    @ApiResponse({ status: 409, description: 'Người dùng đã được đăng ký' })
    @Post()
    async signup(@Body() dto: SignUpDto): Promise<any> {
        return await this.userService.signup(dto)
    }
}