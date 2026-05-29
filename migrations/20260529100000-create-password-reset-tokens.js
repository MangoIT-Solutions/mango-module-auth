module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables().catch(() => []);
    if (tables.includes('password_reset_tokens')) return;

    await queryInterface.createTable('password_reset_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      token_hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('password_reset_tokens', ['token_hash'], { name: 'idx_prt_token_hash' });
    await queryInterface.addIndex('password_reset_tokens', ['user_id'], { name: 'idx_prt_user_id' });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables().catch(() => []);
    if (!tables.includes('password_reset_tokens')) return;
    await queryInterface.dropTable('password_reset_tokens');
  },
};
