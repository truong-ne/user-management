import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MedicalRecordService } from "../services/medicalRecord.service";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender, Relationship } from "src/config/enum.constants";

@ApiTags('MedicalRecord')

@Controller('medical-record')
export class MedicalRecordController {
    constructor(
        private readonly medicalRecordService: MedicalRecordService
    ) { }

    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Chỉnh sửa hồ sơ người dùng', description: 'Thay đổi thông tin người dùng' })
    @ApiParam({ name: 'relationship', enum: Relationship, required: false })
    @ApiParam({ name: 'gender', enum: Gender, required: false })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Sai thông tin sửa đổi của người dùng' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @Patch()
    async updateMedicalRecord(@Req() req, @Body() dto: UpdateProfile): Promise<any> {
        return await this.medicalRecordService.updateMedicalRecord(dto, req.user.id)
    }


    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Xem hồ sơ của người dùng', description: 'Xem tất cả các hồ sơ của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @Get()
    async getAllMedicalRecordByUserId(@Req() req): Promise<any> {
        return await this.medicalRecordService.getAllMedicalRecordByUserId(req.user.id)
    }
}