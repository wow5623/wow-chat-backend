import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Dialog, DialogDocument } from '../../dialogs/schemas/dialog.schema';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dialog',
  })
  dialog: DialogDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  author: UserDocument;

  @Prop({
    type: String,
  })
  text: string;

  @Prop({
    type: Date,
  })
  createdTime: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
