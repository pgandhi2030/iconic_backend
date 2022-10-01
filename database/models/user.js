

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const userSchema = new Schema({
	avatar: String,
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	emailId: {
		type: String,
		lowercase: true,
		trim: true, index: true, unique: true, sparse: true,
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
	},
	password: {
		type: String,
		minlength: [5, 'Minimum password length is 6 characters!'],
		required: false
	},
	mobileNumber: {
		type: String,
		index: true, unique: true, sparse: true
	},
	role: {
		type: String,
		default: 'employee'
	},
	gender: {
		type: String,
		default: 'male'
	},
	photographerType: [String],
	isActive: {
		type: Boolean,
		default: true
	},
	address: String,
	city: String,
	state: String,
	aadharNo: String,
	aadharCardFile: String,
	panNo: String,
	dateOfBirth: String,
	haveVehicle: String,
	vehicleType: String,
	licenseNumber: String,
	approved: {
		type: Boolean,
		default: false
	},
	approvedAt: Date,
	kycDone: {
		type: Boolean,
		default: false
	},
	token: String,
	totalExperience: String,
}, { timestamps: true, strict: false })

userSchema.pre('save', function (next) {
	const user = this;
	if (user.password == null) next();
	bcrypt.genSalt(10, function (err, salt) {
		if (err) { return next(err) }

		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) { return next(err) }

			user.password = hash;
			next();
		});
	});
})

userSchema.methods.validatePassword = function (candidatePassword, done) {
	bcrypt.compare(candidatePassword, this.password, function (error, isSuccess) {
		if (error) { return done(error); }

		return done(null, isSuccess);
	})
}

userSchema.plugin(mongoosePaginate);

module.exports = userSchema;//mongoose.model('User', userSchema);
