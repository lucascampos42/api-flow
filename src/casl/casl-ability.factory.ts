import {
  AbilityBuilder,
  PureAbility,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<any> | 'all';

export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(private prisma: PrismaService) {}

  async createForUser(user: any): Promise<AppAbility> {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    // Superadmin tem acesso total
    if (user.userType === 'CODESDEVS_SUPERADMIN') {
      can(Action.Manage, 'all');
    } else {
      // Buscar regras na tabela AccessRule para o papel do usuário
      const rules = await this.prisma.accessRule.findMany({
        where: { role: user.userType },
      });

      rules.forEach((rule) => {
        if (rule.canRead) can(Action.Read, rule.resource);
        if (rule.canWrite) can(Action.Create, rule.resource);
        if (rule.canUpdate) can(Action.Update, rule.resource);
        if (rule.canDelete) can(Action.Delete, rule.resource);
      });

      // Regras implícitas baseadas em posse de objeto (Exemplo)
      // can(Action.Update, 'Company', { ownerUserId: user.userId });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
