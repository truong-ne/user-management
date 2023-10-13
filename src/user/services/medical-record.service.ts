import { BadRequestException, Injectable, MethodNotAllowedException, NotFoundException } from "@nestjs/common";
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
import { IsDate } from "class-validator";

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
            throw new NotFoundException('user_not_found')

        const record = user.medicalRecords.filter((record) => record.id === dto.profileId)[0]

        if (!record)
            throw new NotFoundException('medical_record_not_found')

        record.full_name = dto.full_name
        var date = new Date(dto.date_of_birth.replace(/(\d+[/])(\d+[/])/, '$2$1'))
        if(isNaN(date.valueOf()))
            throw new BadRequestException('wrong_syntax')
        else
            record.date_of_birth = date
        record.gender = dto.gender
        if (record.isMainProfile !== true) {
            if (!(dto.relationship in Relationship))
                throw new BadRequestException('wrong_syntax')
            record.relationship = dto.relationship
        }
        record.avatar = dto.avatar
        record.address = dto.address
        record.updated_at = this.VNTime()

        try {
            await this.medicalRecordRepository.save(record)
        } catch (error) {
            throw new BadRequestException('update_medical_record_failed')
        }

        return {
            "code": 200,
            "message": "success"
        }
    }

    async getAllMedicalRecordByUserId(id: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { 'id': id }, relations: ['medicalRecords'] })

        if (!user)
            throw new NotFoundException('user_not_found')

        const record = user.medicalRecords

        if (record.length === 0)
            throw new NotFoundException('medical_record_not_found')

        return {
            "code": 200,
            "message": "success",
            "data": record
        }
    }

    async createNewMedicalRecord(dto: AddMedicalRecordDto, id: string): Promise<any> {
        const user = await this.userService.findUserById(id)

        const record = new MedicalRecord()
        record.full_name = dto.full_name
        var date = new Date(dto.date_of_birth.replace(/(\d+[/])(\d+[/])/, '$2$1'))
        if(isNaN(date.valueOf()))
            throw new BadRequestException('wrong_syntax')
        else
            record.date_of_birth = date
        record.gender = dto.gender
        record.relationship = dto.relationship
        record.avatar = dto.avatar
        record.address = dto.address
        record.updated_at = this.VNTime()
        record.manager = user

        try {
            console.log(record)
            await this.medicalRecordRepository.save(record)
        } catch (error) {
            throw new BadRequestException('create_medical_record_failed')
        }

        return {
            "code": 201,
            "message": "created"
        }
    }

    async removeMedicalRecord(id: string, userId: string): Promise<any> {
        const record = await this.medicalRecordRepository.findOne({ where: { 'id': id, 'manager': { 'id': userId } } })

        if (!record)
            throw new NotFoundException('medical_record_not_found')
        else if (record.isMainProfile === true)
            throw new MethodNotAllowedException('Deletion_of_this_medical_record_is_not_allowed')

        try {
            await this.medicalRecordRepository.remove(record)
        } catch (error) {
            throw new BadRequestException('delete_medical_record_failed')
        }

        return {
            "code": 200,
            "message": "success"
        }
    }
}