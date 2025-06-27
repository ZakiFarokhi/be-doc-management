// src/casl/casl-ability.factory.ts
import { Injectable } from '@nestjs/common';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { User, Document, Access, Notification } from '@prisma/client';
import { PureAbility, AbilityBuilder } from '@casl/ability';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type AppSubjects =
  | Subjects<{
      User: User;
      Document: Document;
      UserDocumentAccess: Access;
      Notification: Notification;
    }>
  | 'all';

export type AppAbility = PureAbility<[Actions, AppSubjects], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    can('create', 'Document');
    can('read', 'Document', { visibility: 'PUBLIC' });
    can('manage', 'Document', { authorId: user.id });
    can('read', 'UserDocumentAccess', { userId: user.id });
    can('update', 'UserDocumentAccess', { userId: user.id });
    can('read', 'Notification', { userId: user.id });
    can('update', 'Notification', { userId: user.id });

    return build();
  }
}
