import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { TransactionDto } from '../dto/transaction.dto';

@ApiTags('TRANSACTION')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post()
  async cashIn(
    @Req() req,
    @Body() dto: TransactionDto,
  ) {
    const res = await this.transactionService.HealthlinePaymentCashIn(req.user.id, dto.amount)

    return {
      statusCode: 200,
      data: res,
      message: 'successfully'
    }
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post()
  async cashOut(
    @Req() req,
    @Body() dto: TransactionDto,
  ) {
    return await this.transactionService.HealthlinePaymentCashOut(req.user.id, dto.amount)
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  async TransactionHistory(
    @Req() req
  ) {
    return await this.transactionService.UserTransactionHistory(req.user.id)
  }
}