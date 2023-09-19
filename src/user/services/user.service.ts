import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "../../config/base.service";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "../dtos/sign-up.dto";
import { SubUser } from "../entities/subUser.entity";

@Injectable()
export class UserService extends BaseService<User>{
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(SubUser) private readonly subUserRepository: Repository<SubUser>
    ) {
        super(userRepository)
    }

    async findUserByPhone(phone: string) {
        return await this.userRepository.findOneBy({ phone: phone })
    }

    async signup(dto: SignUpDto): Promise<any> {
        const check = await this.findUserByPhone(dto.phone)

        if (check)
            throw new ConflictException('Số điện thoại đã được đăng kí')

        const user = new User()
        user.full_name = dto.full_name
        user.phone = dto.phone
        user.password = await this.hashing(dto.password)
        user.created_at = this.VNTime()
        user.updated_at = user.created_at

        await this.userRepository.save(user)

        const subUser = new SubUser()
        subUser.full_name = dto.full_name
        subUser.date_of_birth = dto.date_of_birth
        subUser.manager = user

        await this.subUserRepository.save(subUser)

        return {
            "statusCode": 201,
            "message": "Created"
        }
    }

    // async updateProfile(dto: UpdateProfile): Promise<any> {
    //     const user = await this.findUserByPhone(dto.phone)

    //     user.full_name = dto.full_name
    //     user.email_notification = dto.email_notification

    //     await this.userRepository.save(user)

    //     return {
    //         data: {
    //             full_name: user.full_name,
    //             email_notification: user.email_notification
    //         },
    //         role: user.role
    //     }
    // }
}