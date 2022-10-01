const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleBasedAccessSchema = new Schema({
  role: String,
  resource: String,
  hasAccess: { type: Boolean, default: false },
}, { timestamps: true });

roleBasedAccessSchema.index({ role: -1 });

module.exports = roleBasedAccessSchema//mongoose.model('RoleBasedAccess', roleBasedAccessSchema);
