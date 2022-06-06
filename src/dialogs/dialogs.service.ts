import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dialog, DialogDocument } from './schemas/dialog.schema';
import { Model } from 'mongoose';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { Message, MessageDocument } from '../messages/schemas/message.schema';
import { EventsService } from '../events/events.service';
import { AcceptDialogDto } from './dto/accept-dialog.dto';

@Injectable()
export class DialogsService {
  constructor(
    @InjectModel(Dialog.name)
    private readonly dialogsRepository: Model<DialogDocument>,
    @InjectModel(Message.name)
    private readonly messagesRepository: Model<MessageDocument>,
    private usersService: UsersService,
    private eventsService: EventsService,
  ) {}

  async getDialog(dialogId: string) {
    const dialog = await this.findDialog(dialogId);

    if (!dialog) {
      throw new NotFoundException('Диалог не найден!');
    }

    await dialog.populate(['lastMessage', 'initiator', 'companion']);

    await dialog.save();

    return {
      id: dialog._id,
      initiator: {
        id: dialog.initiator._id,
        name: dialog.initiator.name,
        email: dialog.initiator.email,
        isEmailActivated: dialog.initiator.isEmailActivated,
      },
      companion: {
        id: dialog.companion._id,
        name: dialog.companion.name,
        email: dialog.companion.email,
        isEmailActivated: dialog.companion.isEmailActivated,
      },
      initiatorPublicKey: dialog.initiatorPublicKey,
      companionPublicKey: dialog.companionPublicKey,
      createdTime: dialog.createdTime,
      lastMessage: dialog.lastMessage,
      isDialogAccepted: dialog.isDialogAccepted,
    };
  }

  async createDialog(
    createDialogDto: CreateDialogDto,
    initiator: UserDocument,
  ) {
    const companion: UserDocument = await this.usersService.findUserById(
      createDialogDto.companion,
    );

    if (!companion) {
      throw new BadRequestException('Компаньона с таким id не существует!');
    }

    const dialogCandidate = await this.findByCompanions(
      initiator._id,
      companion._id,
    );

    if (dialogCandidate) {
      throw new BadRequestException('Диалог уже существует!');
    }

    const dialog = await this.dialogsRepository.create({
      initiator: initiator._id,
      companion: companion._id,
    });

    dialog.createdTime = new Date();
    dialog.initiatorPublicKey = createDialogDto.initiatorPublicKey;
    dialog.isDialogAccepted = false;

    await dialog.save();

    await dialog.populate(['initiator', 'companion', 'lastMessage']);

    this.eventsService.emitDialogCreated(dialog);

    return {
      id: dialog._id,
      initiator: {
        id: dialog.initiator._id,
        name: dialog.initiator.name,
        email: dialog.initiator.email,
        isEmailActivated: dialog.initiator.isEmailActivated,
      },
      companion: {
        id: dialog.companion._id,
        name: dialog.companion.name,
        email: dialog.companion.email,
        isEmailActivated: dialog.companion.isEmailActivated,
      },
      initiatorPublicKey: dialog.initiatorPublicKey,
      companionPublicKey: dialog.companionPublicKey,
      createdTime: dialog.createdTime,
      lastMessage: dialog.lastMessage,
      isDialogAccepted: dialog.isDialogAccepted,
    };
  }

  async getAllDialogs() {
    return await this.findAllDialogs();
  }

  async getAllMeDialogs(me: UserDocument) {
    return await this.findAllMeDialogs(me);
  }

  async acceptDialog(acceptDialogDto: AcceptDialogDto, user: UserDocument) {
    const dialog = await this.findDialog(acceptDialogDto.dialogId);

    if (!dialog) {
      throw new BadRequestException('Диалог не найден!');
    }

    if (dialog.companion.toString() !== user._id.toString()) {
      console.log(dialog.companion);
      console.log(user._id);
      throw new ForbiddenException(
        'Вы не являетесь компаньоном в этом диалоге и не можете его подтвердить!',
      );
    }

    dialog.companionPublicKey = acceptDialogDto.companionPublicKey;
    dialog.isDialogAccepted = true;

    await dialog.save();

    return {
      id: dialog._id,
      initiator: {
        id: dialog.initiator._id,
        name: dialog.initiator.name,
        email: dialog.initiator.email,
        isEmailActivated: dialog.initiator.isEmailActivated,
      },
      companion: {
        id: dialog.companion._id,
        name: dialog.companion.name,
        email: dialog.companion.email,
        isEmailActivated: dialog.companion.isEmailActivated,
      },
      initiatorPublicKey: dialog.initiatorPublicKey,
      companionPublicKey: dialog.companionPublicKey,
      createdTime: dialog.createdTime,
      lastMessage: dialog.lastMessage,
      isDialogAccepted: dialog.isDialogAccepted,
    };
  }

  async deleteDialog(dialogId: string) {
    try {
      const dialog = await this.dialogsRepository.findOneAndRemove({
        _id: dialogId,
      });
      if (!dialog) {
        throw new NotFoundException('Диалог не найден!');
      }
      return {
        message: 'Диалог удален',
      };
    } catch (err) {
      throw new BadRequestException('Диалог не найден!');
    }
  }

  async findDialog(dialogId: string) {
    return this.dialogsRepository.findOne({ _id: dialogId });
  }

  private async findByCompanions(initiatorId: string, companionId: string) {
    return this.dialogsRepository.findOne({
      initiator: initiatorId,
      companion: companionId,
    });
  }

  private async findAllDialogs() {
    return this.dialogsRepository.find();
  }

  private async findAllMeDialogs(me: UserDocument) {
    const initiatorDialogs: DialogDocument[] = await this.dialogsRepository
      .find({
        initiator: me._id,
      })
      .populate(['initiator', 'companion', 'lastMessage']);

    const companionDialogs: DialogDocument[] = await this.dialogsRepository
      .find({
        companion: me._id,
      })
      .populate(['initiator', 'companion', 'lastMessage']);

    return [...initiatorDialogs, ...companionDialogs].map((dialog) => ({
      id: dialog._id,
      initiator: {
        id: dialog.initiator._id,
        name: dialog.initiator.name,
        email: dialog.initiator.email,
        isEmailActivated: dialog.initiator.isEmailActivated,
      },
      companion: {
        id: dialog.companion._id,
        name: dialog.companion.name,
        email: dialog.companion.email,
        isEmailActivated: dialog.companion.isEmailActivated,
      },
      initiatorPublicKey: dialog.initiatorPublicKey,
      companionPublicKey: dialog.companionPublicKey,
      createdTime: dialog.createdTime,
      lastMessage: dialog.lastMessage,
      isDialogAccepted: dialog.isDialogAccepted,
    }));
  }
}
