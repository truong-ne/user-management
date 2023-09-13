import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "../../config/base.service";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService extends BaseService<User>{
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {
        super(userRepository)
    }

    async getUserById(id: string): Promise<any> {
        try {
            const user = await this.userRepository.findOne({ where: { 'id': id } })
            return user
        } catch (error) {
            throw('Error')
        } 
    }

    async findUserByPhone(phone: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { 'phone': phone } })
            return user
        } catch (error) {
            throw('Forbidden')
        } 
    }
}