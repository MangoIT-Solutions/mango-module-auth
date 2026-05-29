import { DataTypes, Model, type Sequelize } from 'sequelize';
import { randomUUID } from 'crypto';

class PasswordResetToken extends Model {
  declare id: string;
  declare userId: string;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare usedAt: Date | null;
  declare createdAt: Date;
}

export function initPasswordResetTokenModel(sequelize: Sequelize) {
  if (!sequelize.models.PasswordResetToken) {
    PasswordResetToken.init(
      {
        id: { type: DataTypes.UUID, defaultValue: () => randomUUID(), primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
        tokenHash: { type: DataTypes.STRING(64), allowNull: false, field: 'token_hash' },
        expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
        usedAt: { type: DataTypes.DATE, allowNull: true, field: 'used_at' },
      },
      {
        sequelize,
        tableName: 'password_reset_tokens',
        modelName: 'PasswordResetToken',
        underscored: true,
        updatedAt: false,
      },
    );
  }
  return PasswordResetToken;
}

export default PasswordResetToken;
