import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "../../config/base.service";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { GoogleSignup, SignUpDto } from "../dtos/sign-up.dto";
import { MedicalRecord } from "../entities/medical-record.entity";
import { ChangeEmailDto } from "../dtos/change-email.dto";
import { ChangePasswordDto, ChangePasswordForgotDto } from "../dtos/change-password.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as nodemailer from 'nodemailer'
import { nanoid } from "nanoid";
import { promisify } from 'util'
import * as fs from 'fs'
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";

const readFile = promisify(fs.readFile);

const nodemailer = require("nodemailer")

@Injectable()
export class UserService extends BaseService<User>{
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>,
        private readonly amqpConnection: AmqpConnection
    ) {
        super(userRepository)
    }

    async findUserByPhone(phone: string) {
        const user = await this.userRepository.findOneBy({ phone: phone })

        return user
    }

    async findUserById(id: string) {
        const user = await this.userRepository.findOneBy({ id: id })

        if (!user)
            throw new NotFoundException('user_not_found')

        return user
    }

    async signupGoogle(dto: GoogleSignup): Promise<any> {
        const checkPhone = await this.findUserByPhone(dto.phone)

        if (checkPhone)
            throw new ConflictException('phone_number_has_been_registered')

        const checkEmail = await this.userRepository.findOne({
            where: { email: dto.google_email }
        })

        if (checkEmail)
            throw new ConflictException('email_has_been_registered')

        const user = new User()
        user.phone = dto.phone
        user.email = dto.google_email
        user.password = await this.hashing(nanoid(6))
        user.isGoogle = true
        user.created_at = this.VNTime()
        user.updated_at = user.created_at

        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('sign_up_failed')
        }

        const record = new MedicalRecord()
        record.full_name = dto.full_name
        record.avatar = "default"
        record.isMainProfile = true
        record.manager = user
        record.updated_at = this.VNTime()

        try {
            await this.medicalRecordRepository.save(record)
        } catch (error) {
            await this.userRepository.remove(user)
            throw new BadRequestException('sign_up_failed')
        }

        const users = await this.medicalRecordRepository.find({ where: { isMainProfile: true, manager: { id: user.id } }, relations: ['manager'] })

        const data = []
        users.forEach(u => {
            data.push({
                id: u.manager.id,
                full_name: u.full_name,
                date_of_birth: u.date_of_birth,
                gender: u.gender,
                avatar: u.avatar,
                address: u.address,
                account_balance: u.manager.account_balance,
                email: u.manager.email,
                phone: u.manager.phone,
                update_at: u.updated_at
            })
        })

        this.updateMeilisearch(data)

        return {
            "code": 201,
            "message": "created"
        }
    }

    async signup(dto: SignUpDto): Promise<any> {
        if (dto.password !== dto.passwordConfirm)
            throw new BadRequestException('password_incorrect')

        const checkPhone = await this.findUserByPhone(dto.phone)

        if (checkPhone)
            throw new ConflictException('phone_number_has_been_registered')

        const checkEmail = await this.userRepository.findOne({
            where: { email: dto.email }
        })

        if (checkEmail)
            throw new ConflictException('email_has_been_registered')

        const user = new User()
        user.phone = dto.phone
        user.email = dto.email
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
        var date = new Date(dto.date_of_birth.replace(/(\d+[/])(\d+[/])/, '$2$1'))
        if (isNaN(date.valueOf()))
            throw new BadRequestException('wrong_syntax')
        else
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

        const users = await this.medicalRecordRepository.find({ where: { isMainProfile: true, manager: { id: user.id } }, relations: ['manager'] })

        const data = []
        users.forEach(u => {
            data.push({
                id: u.manager.id,
                full_name: u.full_name,
                date_of_birth: u.date_of_birth,
                gender: u.gender,
                avatar: u.avatar,
                address: u.address,
                account_balance: u.manager.account_balance,
                email: u.manager.email,
                phone: u.manager.phone,
                update_at: u.updated_at
            })
        })

        this.updateMeilisearch(data)

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
                "address": main_record.address,
                "point": user.point
            }
        }
    }

    async addDoctorWishList(id: string, doctorId: string): Promise<any> {
        const user = await this.findUserById(id)

        const length = user.wish_list.length

        user.wish_list = user.wish_list.filter(function(item) {
            return item !== doctorId;
        });

        if(user.wish_list.length === length)
            user.wish_list.push(doctorId)

        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('add_wish_lish_failed')
        }

        return {
            "code": 200,
            "message": "success"
        }
    }

    async removeDoctorWishList(id: string, doctorId: string): Promise<any> {
        const user = await this.findUserById(id)

        user.wish_list = user.wish_list.filter(function(item) {
            return item !== doctorId;
          });

        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('remove_wish_lish_failed')
        }

        return {
            "code": 200,
            "message": "success"
        }
    }

    async getDoctorWishList(id: string): Promise<any> {
        const user = await this.findUserById(id)

        const rabbitmq = await this.amqpConnection.request<any>({
            exchange: 'healthline.doctor.information',
            routingKey: 'doctor',
            payload: user.wish_list,
            timeout: 10000,
        })

        if(!rabbitmq)
            throw new BadRequestException('get_wish_list_failed')

        return {
            "code": 200,
            "message": "success",
            "data": rabbitmq.data
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

    async changeUserPassword(dto: ChangePasswordDto, id: string): Promise<any> {
        const user = await this.findUserById(id)

        if(!(await this.isMatch(dto.password, user.password)))
            throw new BadRequestException('current_password_wrong')
        else if(dto.password === dto.new_password)
            throw new BadRequestException('password_same_current_password')
        else
            user.password = await this.hashing(dto.new_password)

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

    async depositMoney(money: number, userId: string) {
        const user = await this.findUserById(userId)

        user.account_balance += money
        await this.userRepository.save(user)

        return {
            "code": 200,
            "message": "success"
        }
    }

    async adminChangeUserPassword(id: string): Promise<any> {
        const user = await this.findUserById(id)

        const password = nanoid(10)

        user.password = await this.hashing(password)

        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('update_user_failed')
        }

        await this.mailer(user.email, password)

        return {
            "code": 200,
            "message": "success"
        }
    }

    async forgetPassword(email: string): Promise<any> {
        const checkEmail = await this.userRepository.findOne({
            where: { email: email }
        })

        if (!checkEmail)
            throw new NotFoundException('email_not_found')

        const rabbitmq = await this.amqpConnection.request<any>({
            exchange: 'healthline.user.information',
            routingKey: 'create_otp',
            payload: checkEmail.id,
            timeout: 10000,
        })

        if (!rabbitmq || rabbitmq === '')
            throw new BadRequestException('send_email_failed')

        await this.mailer(checkEmail.email, rabbitmq)

        return {
            "code": 200,
            "message": "success"
        }
    }

    async changePasswordForgot(dto: ChangePasswordForgotDto): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { email: dto.email }
        })
        if (!user)
            throw new NotFoundException('email_not_found')

        if (dto.password !== dto.passwordConfirm)
            throw new BadRequestException('password_incorrect')
        else if (user.password === dto.password)
            throw new BadRequestException('password_had_use')
        else {
            const rabbitmq = await this.amqpConnection.request<any>({
                exchange: 'healthline.user.information',
                routingKey: 'check_otp',
                payload: { userId: user.id, code: dto.otp },
                timeout: 10000,
            })

            if (rabbitmq) {
                user.password = await this.hashing(dto.password)
            } else
                throw new BadRequestException('otp_expired')
        }

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


    async mailer(email: string, password: string) {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "healthlinemanager2023@gmail.com",
                pass: "eizm tolt wjyi qdjn",
            },
        });

        const htmlContent = await readFile('./src/template/newpassword.html', 'utf8');
        const modifiedHtmlContent = htmlContent.replace('{{ password }}', password);

        const info = await transporter.sendMail({
            from: '"Healthline Inc" <healthlinemanager2023@gmail.com>',
            to: `${email}`,
            subject: "[PASSWORD] DOCTOR", // Subject line
            text: `Your new Password is ${password}`, // plain text body
            html: modifiedHtmlContent
        });

        console.log("Password sent: %s", info.messageId);
    }

    async updateMeilisearch(data: any) {
        const response = await fetch('https://meilisearch-truongne.koyeb.app/indexes/user/documents', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer CHOPPER_LOVE_MEILISEARCH",
            },
            body: JSON.stringify(data),
        });
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async getAllUsers() {
        const users = await this.medicalRecordRepository.find({ where: { isMainProfile: true }, relations: ['manager'] })

        const data = []
        users.forEach(u => {
            data.push({
                id: u.manager.id,
                full_name: u.full_name,
                date_of_birth: u.date_of_birth,
                gender: u.gender,
                avatar: u.avatar,
                address: u.address,
                account_balance: u.manager.account_balance,
                email: u.manager.email,
                phone: u.manager.phone,
                created_at: u.manager.created_at,
                update_at: u.updated_at
            })
        })

        await this.updateMeilisearch(data)
    }
}