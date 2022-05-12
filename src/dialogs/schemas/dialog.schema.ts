import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import {
  Message,
  MessageDocument,
} from '../../messages/schemas/message.schema';

export type DialogDocument = Dialog & Document;

@Schema()
export class Dialog {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  initiator: UserDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  companion: UserDocument;

  @Prop({
    type: String,
  })
  initiatorPublicKey: string;

  @Prop({
    type: String,
  })
  companionPublicKey: string;

  @Prop({
    type: Date,
  })
  createdTime: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Message.name,
  })
  lastMessage: MessageDocument;

  @Prop({
    type: Boolean,
  })
  isDialogAccepted: boolean;
}

export const DialogSchema = SchemaFactory.createForClass(Dialog);
