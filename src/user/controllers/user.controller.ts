import { Body, Controller, Param, Get, Post, UseGuards, Req, Patch, UseInterceptors, Inject } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { GoogleSignup, SignUpDto } from "../dtos/sign-up.dto";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender, Relationship } from "../../config/enum.constants";
import { ChangeEmailDto } from "../dtos/change-email.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ChangePasswordDto, ChangePasswordForgotDto } from "../dtos/change-password.dto";
import { AdminGuard } from "src/auth/guards/admin.guard";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as CryptoJS from 'crypto-js'

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

    @ApiOperation({ summary: 'Đăng ký dành cho người dùng bằng google', description: 'Đăng ký thành công sẽ tạo người dùng mới' })
    @ApiParam({ name: 'gender', enum: Gender, required: false })
    @ApiResponse({ status: 201, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Sai thông tin đăng ký của người dùng' })
    @ApiResponse({ status: 409, description: 'Người dùng đã được đăng ký' })
    @Post('google')
    async signupGoogle(@Body() dto: GoogleSignup): Promise<any> {
        return await this.userService.signupGoogle(dto)
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xem tài khoản người dùng', description: 'Thông tin tài khoản đăng nhập' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản' })
    @Get()
    async getUserLogin(@Req() req): Promise<any> {
        // const cacheSchedules = await this.cacheManager.get('user-' + req.user.id);
        // if (cacheSchedules) return cacheSchedules

        const data = await this.userService.getUserLogin(req.user.id)
        // await this.cacheManager.set('user-' + req.user.id, data)

        return data
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chỉnh sửa thông tin tài khoản', description: 'Thông tin tài khoản được thay đổi' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Đổi thông tin người dùng thất bại' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy Tài khoản' })
    @Patch('/email')
    async changeUserEmail(@Body() dto: ChangeEmailDto, @Req() req): Promise<any> {
        const data = await this.userService.changeUserEmail(dto, req.user.id)
        await this.cacheManager.del('user-' + req.user.id)
        return data
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thay đổi mật khẩu của người dùng', description: 'Thay đổi mật khẩu của người dùng khi người dùng đã đăng nhập' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Đổi mật khẩu người dùng thất bại' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy Tài khoản' })
    @Patch('/password')
    async changeUserPassword(@Body() dto: ChangePasswordDto, @Req() req): Promise<any> {
        const data = await this.userService.changeUserPassword(dto, req.user.id)
        await this.cacheManager.del('user-' + req.user.id)
        return data
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Patch('reset-password/:userId')
    async resetPasswordByAdmin(
        @Param('userId') userId: string
    ) {
        return await this.userService.adminChangeUserPassword(userId)
    }

    @UseGuards(JwtGuard)
    @Post('wish-list')
    async addDoctorWishList(
        @Body("doctorId") doctorId: string,
        @Req() req
    ) {
        return await this.userService.addDoctorWishList(req.user.id, doctorId)
    }

    @UseGuards(JwtGuard)
    @Get('wish-list')
    async getDoctorWishList(
        @Req() req
    ) {
        return await this.userService.getDoctorWishList(req.user.id)
    }

    @Post('forget-password/:gmail')
    async forgetPassword(
        @Param('gmail') gmail: string
    ) {
        return await this.userService.forgetPassword(gmail) 
    }

    @Post('reset-password-forgot')
    async changePasswordForgot(
        @Body() dto: ChangePasswordForgotDto
    ) {
        return await this.userService.changePasswordForgot(dto)
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @Post('deposit-money/:money')
    async depositMoney(
        @Param('money') money: number,
        @Req() req
    ) {
        return await this.userService.depositMoney(money, req.user.id)
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Get('/admin/:id')
    async getUserLoginByAdmin(@Param('id') id: string): Promise<any> {
        const data = await this.userService.getUserLogin(id)

        return data
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Người dùng mới theo tháng/năm' })
    @Get('/admin/user/:year')
    async newUserStatistic(@Param('year') year: number): Promise<any> {
        const data = await this.userService.newUserStatistic(year)

        return data
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin dừng hoạt động của bs' })
    @Get('admin/user/ban/:user_id')
    async disactiveUser(@Param('user_id') user_id: string) {
        return await this.userService.disactiveUser(user_id)
    }


    @ApiOperation({ summary: 'Momo' })
    @Get('/admin/momo')
    async test(): Promise<any> {
        const date = new Date().getTime();
        const requestId = date + "id";
        const orderId = date + ":0123456778";
        const autoCapture = true;
        const requestType = "captureWallet";
        const notifyUrl = "https://sangle.free.beeceptor.com";
        const returnUrl = "https://sangle.free.beeceptor.com";
        const amount = "10000";
        const orderInfo = "Thanh toán qua Website";
        const extraData = "ew0KImVtYWlsIjogImh1b25neGRAZ21haWwuY29tIg0KfQ==";
        let signature = "accessKey=" + 'klm05TvNBzhg7h7j' + "&amount=" + amount +
          "&extraData=" + extraData + "&ipnUrl=" + notifyUrl + "&orderId=" + orderId +
          "&orderInfo=" + orderInfo + "&partnerCode=" + 'MOMOBKUN20180529' + "&redirectUrl=" +
          returnUrl + "&requestId=" + requestId + "&requestType=" + requestType;
        const hash = await CryptoJS.HmacSHA256(signature, 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa');
        signature = CryptoJS.enc.Hex.stringify(hash)
    
    
        const req = {
          "partnerCode": "MOMOBKUN20180529",
          "partnerName": "Test",
          "storeId": "MOMOBKUN20180529",
          "requestType": "captureWallet",
          "ipnUrl": "https://sangle.free.beeceptor.com",
          "redirectUrl": "https://sangle.free.beeceptor.com",
          "orderId": orderId,
          "amount": amount,
          "lang": "vi",
          "autoCapture": true,
          "orderInfo": "Thanh toán qua Website",
          "requestId": requestId,
          "extraData": extraData,
          "signature": signature
        }
    
        const data = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req)
        })
        // console.log(await data.json())
        return await data.json()
      }
}