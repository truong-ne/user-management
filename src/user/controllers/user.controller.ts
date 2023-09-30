import { Body, Controller, Param, Get, Post, UseGuards, Req, Patch } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { SignUpDto } from "../dtos/sign-up.dto";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender, Relationship } from "../../config/enum.constants";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @ApiOperation({ summary: 'Đăng ký dành cho người dùng', description: 'Đăng ký thành công sẽ tạo người dùng mới' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Sai thông tin đăng ký của người dùng' })
    @ApiResponse({ status: 409, description: 'Người dùng đã được đăng ký' })
    @Post()
    async signup(@Body() dto: SignUpDto): Promise<any> {
        return await this.userService.signup(dto)
    }

    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Chỉnh sửa hồ sơ người dùng', description: 'Thay đổi thông tin người dùng' })
    @ApiParam({ name: 'relationship', enum: Relationship, required: false })
    @ApiParam({ name: 'gender', enum: Gender, required: false })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Sai thông tin sửa đổi của người dùng' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @Patch()
    async updateProfile(@Req() req, @Body() dto: UpdateProfile): Promise<any> {
        return await this.userService.updateProfile(dto, req.user.id)
    }


    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Xem hồ sơ của người dùng', description: 'Xem tất cả các hồ sơ của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @Get('/profile')
    async getProfileByUserId(@Req() req): Promise<any> {
        return await this.userService.getProfileByUserId(req.user.id)
    }
}