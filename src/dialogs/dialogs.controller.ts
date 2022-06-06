import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { DialogsService } from './dialogs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AcceptDialogDto } from './dto/accept-dialog.dto';

@Controller('dialogs')
export class DialogsController {
  constructor(private dialogsService: DialogsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/getDialog/:dialogId')
  getDialog(@Param('dialogId') dialogId: string) {
    return this.dialogsService.getDialog(dialogId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/createDialog')
  createDialog(@Body() createDialogDto: CreateDialogDto, @Request() req) {
    return this.dialogsService.createDialog(createDialogDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAllDialogs')
  getAllDialogs() {
    return this.dialogsService.getAllDialogs();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAllMeDialogs')
  getAllMeDialogs(@Request() req) {
    return this.dialogsService.getAllMeDialogs(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/acceptDialog')
  acceptDialog(@Body() acceptDialogDto: AcceptDialogDto, @Request() req) {
    return this.dialogsService.acceptDialog(acceptDialogDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/deleteDialog/:dialogId')
  deleteDialog(@Param('dialogId') dialogId: string) {
    return this.dialogsService.deleteDialog(dialogId);
  }
}
