import { BadRequestException, Injectable, MethodNotAllowedException, NotFoundException } from "@nestjs/common";
import { BaseService } from "../../config/base.service";
import { MedicalRecord } from "../entities/medical-record.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Repository } from "typeorm";
import { SignUpDto } from "../dtos/sign-up.dto";
import { User } from "../entities/user.entity";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { UserService } from "./user.service";
import { Gender, Relationship } from "../../config/enum.constants";
import { AddMedicalRecordDto } from "../dtos/add-medical-record.dto";
import { IsDate } from "class-validator";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";

@Injectable()
export class MedicalRecordService extends BaseService<MedicalRecord>{
    constructor(
        private readonly userService: UserService,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly amqpConnection: AmqpConnection

    ) {
        super(medicalRecordRepository)
    }

    async findAllMainRecord(uids: string[]) {
        const records = await this.medicalRecordRepository.find({ where: { isMainProfile: true, manager: { id: In(uids) } }, relations: ['manager']  })

        if(records.length === 0)
            throw new NotFoundException('medical_record_not_found')

        const data = []
        records.forEach(e => {
            data.push({
                uid: e.manager.id,
                full_name: e.full_name,
                avatar: e.avatar
            })
        })
        return {
            "code": 200,
            "message": "success",
            "data": data
        }
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
        const user = await this.userRepository.findOne({ where: { 'id': id, medicalRecords: { isDeleted: false } }, relations: ['medicalRecords'] })

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
        record.created_at = this.VNTime()
        record.updated_at = record.created_at
        record.manager = user

        try {
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

        const check = await this.amqpConnection.request<any>({
            exchange: 'healthline.user.information',
            routingKey: 'check_medical',
            payload: record.id,
            timeout: 10000,
        })

        if(!check) {
            throw new MethodNotAllowedException('Deletion_of_this_medical_record_is_not_allowed')
        }
        
        try {
            record.isDeleted = true
            await this.medicalRecordRepository.save(record)
        } catch (error) {
            throw new BadRequestException('delete_medical_record_failed')
        }

        return {
            "code": 200,
            "message": "success"
        }
    }

    async getAllMedicalRecordPerPage(page: number, num: number): Promise<any> {
        var skip = (page - 1) * num
        const records = await this.medicalRecordRepository.find({ skip: skip, take: num, order: { updated_at: "DESC" } })
        const data = []
        
        records.forEach(r => {
            var relation = ""
            if(r.relationship !== null)
                relation = r.relationship
            data.push({
                id: r.id,
                full_name: r.full_name,
                date_of_birth: r.date_of_birth,
                gender: r.gender,
                relationship: relation,
                avatar: r.avatar,
                address: r.address,
                updated_at: r.updated_at
            })
        })
        return {
            "code": 200,
            "message": "success",
            "data": data
        }
    }

    
    async rangeAge(ids: string[], year: number) {
        const medicals = await this.medicalRecordRepository.find({ where: { id: In(ids) } })
        var rangeAge = {
            '0-10': [],
            '10-30': [],
            '30-40': [],
            '40-50': [],
            'Trên 50': []
        }
        medicals.forEach(m => {
            if(year - m.date_of_birth.getFullYear() < 10) {
                rangeAge['0-10'].push(m.id)
            }
            else if(year - m.date_of_birth.getFullYear() < 30) {
                rangeAge['10-30'].push(m.id)
            }
            else if(year - m.date_of_birth.getFullYear() < 40) {
                rangeAge['30-40'].push(m.id)
            }
            else if(year - m.date_of_birth.getFullYear() < 50) {
                rangeAge['40-50'].push(m.id)
            }
            else if(year - m.date_of_birth.getFullYear() >= 50) {
                rangeAge['Trên 50'].push(m.id)
            }
        })

        return rangeAge
    }

    async getQuantityPatient(): Promise<any> {
        const users = await this.medicalRecordRepository.find()
        return {
            "code": 200,
            "message": "success",
            "data": users.length
        }
    }

    async statisticalMedicalRecord(): Promise<any> {
        const medicals = await this.medicalRecordRepository.find()

        const date = this.VNTime()
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1); // Ngày bắt đầu tháng
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Ngày cuối cùng của tháng

        const medicalIncrease = medicals.filter(m => m.updated_at >= startDate && m.updated_at <= endDate);

        return {
            "code": 200,
            "message": "success",
            "data": {
                quantity: medicals.length,
                increase: medicalIncrease.length
            }
        }
    }
}