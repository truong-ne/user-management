import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "../../config/base.service";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "../dtos/sign-up.dto";
import { SubUser } from "../entities/subUser.entity";
import { UpdateProfile } from "../dtos/update-profile.dto";
import { Gender } from "../../config/enum.constants";

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
        user.full_name = dto.full_name
        user.phone = dto.phone
        user.password = await this.hashing(dto.password)
        user.address = dto.address
        user.created_at = this.VNTime()
        user.updated_at = user.created_at
        
        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('Đăng ký thất bại')
        }

        const subUser = new SubUser()
        subUser.full_name = dto.full_name
        var date = new Date(dto.date_of_birth)
        subUser.date_of_birth = date
        subUser.gender = dto.gender
        subUser.isMainProfile = true
        subUser.manager = user
        subUser.updated_at = this.VNTime()

        try {
            await this.subUserRepository.save(subUser)
        } catch (error) {
            await this.userRepository.remove(user)
            throw new BadRequestException('Đăng ký thất bại')
        }

        return {
            "code": 201,
            "message": "Created"
        }
    }

    async updateUser(dto: UpdateProfile, id: string): Promise<any> {
        const user = await this.findUserById(id)

        if (!user)
            throw new NotFoundException('Tài khoản không tồn tại')

        if (!(dto.gender in Gender))
            throw new BadRequestException('Sai cú pháp!')
        

        user.full_name = dto.full_name
        user.address = dto.address
        user.updated_at = this.VNTime()
        
        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('Chỉnh sửa thất bại')
        }

        const subUser = await this.subUserRepository.findOneBy({'manager': { 'id': user.id}, 'isMainProfile': true})
        subUser.avatar = dto.avatar
        subUser.full_name = dto.full_name
        var date = new Date(dto.date_of_birth)
        subUser.date_of_birth = date
        subUser.gender = dto.gender
        subUser.updated_at = this.VNTime()

        try {
            await this.subUserRepository.save(subUser)
        } catch (error) {
            throw new BadRequestException('Chỉnh sửa thất bại')
        }

        return {
            "code": 200,
            "message": "Success"
        }
    }
}