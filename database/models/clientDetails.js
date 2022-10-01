

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const clientDetails = new Schema({
	groomName: {
		type: String,
	},
	brideName: {
		type: String,
	},
	email: {
		type: String,
		lowercase: true,
		trim: true, index: true, unique: true, sparse: true,
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
	},
	mobile_number: {
		type: String,
		index: true, unique: true, sparse: true
	},
	eventDate: Date,
	photographyType: String,
	oppositeSideStudio: String,
	referenceBy: String,
	status: {
		type: String,
		default: "Pending"
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
}, { timestamps: true, strict: false })

clientDetails.plugin(mongoosePaginate);

module.exports = clientDetails;//mongoose.model('User', clientDetails);
