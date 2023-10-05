import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "../../config/base.service";
import { MedicalRecord } from "../entities/medical-record.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignUpDto } from "../dtos/sign-up.dto";
import { User } from "../entities/user.entity";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { UserService } from "./user.service";
import { Gender, Relationship } from "../../config/enum.constants";
import { AddMedicalRecordDto } from "../dtos/add-medical-record.dto";

@Injectable()
export class MedicalRecordService extends BaseService<MedicalRecord>{
    constructor(
        private readonly userService: UserService,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(User) private readonly userRepository: Repository<User>

    ) {
        super(medicalRecordRepository)
    }

    async updateMedicalRecord(dto: UpdateProfile, id: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { 'id': id }, relations: ['medicalRecords'] })

        if (!user)
            throw new NotFoundException('Tài khoản không tồn tại')

        if (!(dto.gender in Gender))
            throw new BadRequestException('Sai cú pháp!')

        const record = user.medicalRecords.filter((record) => record.id === dto.profileId)[0]
        
        if (!record)
            throw new NotFoundException('Hồ sơ không tồn tại')

        record.full_name = dto.full_name
        var date = new Date(dto.date_of_birth)
        record.date_of_birth = date
        record.gender = dto.gender
        if(record.isMainProfile !== true) {
            if (!(dto.relationship in Relationship))
                throw new BadRequestException('Sai cú pháp!')
            record.relationship = dto.relationship
        } 
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
        const user = await this.userRepository.findOne({ where: { 'id': id }, relations: ['medicalRecords'] })

        if (!user)
            throw new NotFoundException('Tài khoản không tồn tại')

        const record = user.medicalRecords
        
        if (record.length === 0)
            throw new NotFoundException('Không có hồ sơ nào')

        return {
            "code": 200,
            "message": "Success",
            "data": record 
        }
    }

    async createNewMedicalRecord(dto: AddMedicalRecordDto, id: string): Promise<any> {
        const user = await this.userService.findUserById(id)

        if (!user)
            throw new NotFoundException('Tài khoản không tồn tại')

        const record = new MedicalRecord()
        record.full_name = dto.full_name
        var date = new Date(dto.date_of_birth)
        record.date_of_birth = date
        record.gender = dto.gender
        record.relationship = dto.relationship 
        record.avatar = dto.avatar
        record.address = dto.address
        record.updated_at = this.VNTime()
        record.manager = user

        try {
            await this.medicalRecordRepository.save(record)
        } catch (error) {
            throw new BadRequestException('Thêm hồ sơ thất bại')
        }

        return {
            "code": 201,
            "message": "Created"
        }
    }
}