import { Body, Controller, Param, Get, Post, UseGuards, Req, Patch, UseInterceptors, Inject } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { SignUpDto } from "../dtos/sign-up.dto";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender, Relationship } from "../../config/enum.constants";
import { ChangeEmailDto } from "../dtos/change-email.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
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

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xem tài khoản người dùng', description: 'Thông tin tài khoản đăng nhập' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản' })
    @Get()
    async getUserLogin(@Req() req): Promise<any> {
        const cacheSchedules = await this.cacheManager.get('user-' + req.user.id);
        if (cacheSchedules) return cacheSchedules

        const data = await this.userService.getUserLogin(req.user.id)
        await this.cacheManager.set('user-' + req.user.id, data)

        return data
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chỉnh sửa thông tin tài khoản', description: 'Thông tin tài khoản được thay đổi' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Đổi thông tin người dùng thất bại' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy Tài khoản' })
    @Patch()
    async changeUserEmail(@Body() dto: ChangeEmailDto, @Req() req): Promise<any> {
        const data = await this.userService.changeUserEmail(dto, req.user.id)
        await this.cacheManager.del('user-' + req.user.id)
        return data
    }
}