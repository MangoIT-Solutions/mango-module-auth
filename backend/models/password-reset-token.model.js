const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');

let PasswordResetToken;

function initPasswordResetTokenModel(sequelize) {
  PasswordResetToken = sequelize.define(
    'PasswordResetToken',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => randomUUID(),
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'token_hash',
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'used_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(),
        field: 'created_at',
      },
    },
    {
      tableName: 'password_reset_tokens',
      timestamps: false,
    },
  );

  return PasswordResetToken;
}

function getPasswordResetTokenModel() {
  if (!PasswordResetToken) {
    throw new Error('PasswordResetToken model has not been initialized');
  }
  return PasswordResetToken;
}

module.exports = {
  initPasswordResetTokenModel,
  getPasswordResetTokenModel,
};
