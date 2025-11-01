const Log = require('../models/Log');

const logActivity = async (userId, action, ip) => {
  try {
    await Log.create({ user: userId, action, ip });
  } catch (error) {
    console.error('❌ Lỗi ghi log:', error.message);
  }
};

module.exports = logActivity;
