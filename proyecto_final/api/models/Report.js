const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reportType: {
      type: DataTypes.ENUM('post', 'comment'),
      allowNull: false
    },
    reportedItemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.ENUM(
        'spam',
        'inappropriate_content',
        'harassment',
        'violence',
        'copyright',
        'misinformation',
        'hate_speech',
        'other'
      ),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
      defaultValue: 'pending'
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DVH: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'Reports',
    timestamps: true,
    // Deshabilitar foreign keys para evitar conflictos con la tabla existente
    freezeTableName: true,
  // Eliminar hooks temporales para evitar el problema del DVH
    // hooks: {
    //   beforeCreate: (report) => {
    //     const crypto = require('crypto');
    //     const data = `${report.reporterId}${report.reportType}${report.reportedItemId}${report.reason}${report.description || ''}${report.status}`;
    //     report.DVH = crypto.createHash('md5').update(data).digest('hex').slice(0, 8);
    //   },
    //   beforeUpdate: (report) => {
    //     const crypto = require('crypto');
    //     const data = `${report.reporterId}${report.reportType}${report.reportedItemId}${report.reason}${report.description || ''}${report.status}`;
    //     report.DVH = crypto.createHash('md5').update(data).digest('hex').slice(0, 8);
    //   }
    // }
  });

  Report.associate = (models) => {
    // Asociación deshabilitada temporalmente para evitar conflictos con foreign keys
    // Report.belongsTo(models.User, {
    //   foreignKey: 'reporterId',
    //   as: 'reporter'
    // });
    // Report.belongsTo(models.User, {
    //   foreignKey: 'reviewedBy',
    //   as: 'reviewer'
    // });
  };

module.exports = { Report };