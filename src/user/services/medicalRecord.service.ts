import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/config/base.service";
import { MedicalRecord } from "../entities/medicalRecord.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignUpDto } from "../dtos/sign-up.dto";
import { User } from "../entities/user.entity";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { UserService } from "./user.service";
import { Gender } from "../../config/enum.constants";

@Injectable()
export class MedicalRecordService extends BaseService<MedicalRecord>{
    constructor(
        private readonly userService: UserService,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>
    ) {
        super(medicalRecordRepository)
    }

    async updateMedicalRecord(dto: UpdateProfile, id: string): Promise<any> {
        const user = await this.userService.findUserById(id)

        if (!user)
            throw new NotFoundException('Tài khoản không tồn tại')

        if (!(dto.gender in Gender))
            throw new BadRequestException('Sai cú pháp!')

        const record = await this.medicalRecordRepository.findOneBy({'id': dto.profileId, 'manager': { 'id': user.id}})
        
        if (!record)
            throw new NotFoundException('Hồ sơ không tồn tại')

        record.full_name = dto.full_name
        var date = new Date(dto.date_of_birth)
        record.date_of_birth = date
        record.gender = dto.gender
        if(record.isMainProfile !== true)
            record.relationship = dto.relationship 
        record.avatar = dto.avatar
        record.address = dto.address
        record.updated_at = this.VNTime()

        try {
            await this.medicalRecordRepository.save(record)
        } catch (error) {
            throw new BadRequestException('Chỉnh sửa thất bại')
        }

        return {
            "code": 200,
            "message": "Success"
        }
    }

    async getAllMedicalRecordByUserId(id: string): Promise<any> {
        const user = await this.userService.findUserById(id)

        if (!user)
            throw new NotFoundException('Tài khoản không tồn tại')

        const record = await this.medicalRecordRepository.findBy({'manager': { 'id': user.id}})
        
        if (record.length === 0)
            throw new NotFoundException('Không có hồ sơ nào')

        return {
            "code": 200,
            "message": "Success",
            "data": record 
        }
    }
}