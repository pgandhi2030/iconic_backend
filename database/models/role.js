const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const role = new Schema({
  roleName: String,
  roleDisplayName: String
}, { timestamps: true });


module.exports = role//mongoose.model('Role', role);
