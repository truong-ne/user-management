import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "../../config/base.service";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "../dtos/sign-up.dto";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender } from "../../config/enum.constants";
import { MedicalRecord } from "../entities/medical-record.entity";
import { ChangeEmailDto } from "../dtos/change-email.dto";

@Injectable()
export class UserService extends BaseService<User>{
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>
    ) {
        super(userRepository)
    }

    async findUserByPhone(phone: string) {
        const user = await this.userRepository.findOneBy({ phone: phone })

        return user
    }

    async findUserById(id: string) {
        const user = await this.userRepository.findOneBy({ id: id })

        if(!user)
            throw new NotFoundException('user_not_found')

        return user
    }

    async signup(dto: SignUpDto): Promise<any> {
        if(dto.password !== dto.passwordConfirm)
            throw new BadRequestException('password_incorrect')

        const check = await this.findUserByPhone(dto.phone)

        if (check)
            throw new ConflictException('phone_number_has_been_registered')

        const user = new User()
        user.phone = dto.phone
        user.password = await this.hashing(dto.password)
        user.created_at = this.VNTime()
        user.updated_at = user.created_at
        
        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('sign_up_failed')
        }

        const record = new MedicalRecord()
        record.full_name = dto.full_name
        var date = new Date(dto.date_of_birth)
        record.date_of_birth = date
        record.gender = dto.gender
        record.avatar = "default"
        record.isMainProfile = true
        record.manager = user
        record.address = dto.address
        record.updated_at = this.VNTime()

        try {
            await this.medicalRecordRepository.save(record)
        } catch (error) {
            await this.userRepository.remove(user)
            throw new BadRequestException('sign_up_failed')
        }

        return {
            "code": 201,
            "message": "created"
        }
    }

    async getUserLogin(id: string): Promise<any> {
        const user = await this.findUserById(id)

        const main_record = await this.medicalRecordRepository.findOneBy({ 'manager': { 'id': id }, 'isMainProfile': true })

        return {
            "code": 200,
            "message": "success",
            "data": {
                "phone": user.phone,
                "email": user.email,
                "account_balance": user.account_balance,
                "full_name": main_record.full_name,
                "date_of_birth": main_record.date_of_birth,
                "gender": main_record.gender,
                "avatar": main_record.avatar,
                "address": main_record.address
            } 
        }
    }

    async changeUserEmail(dto: ChangeEmailDto, id: string): Promise<any> {
        const user = await this.findUserById(id)

        user.email = dto.email

        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('update_user_failed')
        }

        return {
            "code": 200,
            "message": "success"
        }
    }
}