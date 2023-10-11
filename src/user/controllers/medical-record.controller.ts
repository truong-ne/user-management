import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MedicalRecordService } from "../services/medical-record.service";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender, Relationship } from "src/config/enum.constants";
import { AddMedicalRecordDto } from "../dtos/add-medical-record.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@ApiTags('Medical Record')

@Controller('medical-record')
export class MedicalRecordController {
    constructor(
        private readonly medicalRecordService: MedicalRecordService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chỉnh sửa hồ sơ người dùng', description: 'Thay đổi thông tin người dùng' })
    @ApiParam({ name: 'relationship', enum: Relationship, required: false })
    @ApiParam({ name: 'gender', enum: Gender, required: false })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Sai thông tin sửa đổi của người dùng' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @Patch()
    async updateMedicalRecord(@Req() req, @Body() dto: UpdateProfile): Promise<any> {
        const data = await this.medicalRecordService.updateMedicalRecord(dto, req.user.id)
        await this.cacheManager.del('medicalRecord-' + req.user.id)
        return data
    }


    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xem hồ sơ của người dùng', description: 'Xem tất cả các hồ sơ của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @Get()
    async getAllMedicalRecordByUserId(@Req() req): Promise<any> {
        const cacheSchedules = await this.cacheManager.get('medicalRecord-' + req.user.id);
        if (cacheSchedules) return cacheSchedules

        const data = await this.medicalRecordService.getAllMedicalRecordByUserId(req.user.id)

        await this.cacheManager.set('medicalRecord-' + req.user.id, data)

        return data
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thêm hồ sơ người dùng', description: 'Thêm hồ sơ người dùng mới' })
    @ApiParam({ name: 'relationship', enum: Relationship, required: false })
    @ApiParam({ name: 'gender', enum: Gender, required: false })
    @ApiResponse({ status: 201, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Sai thông tin đầu vào' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @Post()
    async createNewMedicalRecord(@Req() req, @Body() dto: AddMedicalRecordDto): Promise<any> {
        const data = await this.medicalRecordService.createNewMedicalRecord(dto, req.user.id)
        await this.cacheManager.del('medicalRecord-' + req.user.id)
        return data
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa hồ sơ của người dùng', description: 'Xóa hồ sơ của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Không cho phép xóa hồ sơ' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @ApiResponse({ status: 405, description: 'Không được xóa hồ sơ này' })
    @Delete(':profileId')
    async removeMedicalRecord(@Param('profileId')profileId: string, @Req() req): Promise<any> {
        const data = await this.medicalRecordService.removeMedicalRecord(profileId, req.user.id)
        await this.cacheManager.del('medicalRecord-' + req.user.id)
        return data
    }
}