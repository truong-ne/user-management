import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "../../config/base.service";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "../dtos/sign-up.dto";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender } from "../../config/enum.constants";
import { MedicalRecord } from "../entities/medicalRecord.entity";

@Injectable()
export class UserService extends BaseService<User>{
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>
    ) {
        super(userRepository)
    }

    async findUserByPhone(phone: string) {
        return await this.userRepository.findOneBy({ phone: phone })
    }

    async findUserById(id: string) {
        return await this.userRepository.findOneBy({ id: id })
    }

    async signup(dto: SignUpDto): Promise<any> {
        if (!(dto.gender in Gender))
            throw new BadRequestException('Sai cú pháp!')

        if(dto.password !== dto.passwordConfirm)
            throw new BadRequestException('Mật khẩu không khớp')

        const check = await this.findUserByPhone(dto.phone)

        if (check)
            throw new ConflictException('Số điện thoại đã được đăng kí')

        const user = new User()
        user.phone = dto.phone
        user.password = await this.hashing(dto.password)
        user.created_at = this.VNTime()
        user.updated_at = user.created_at
        
        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('Đăng ký thất bại')
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
            throw new BadRequestException('Đăng ký thất bại')
        }

        return {
            "code": 201,
            "message": "Created"
        }
    }
}