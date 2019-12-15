const {
	getSessionInfoHelper
} = require("../util/helper")
const resolvers = {
	Query: {
		getSession: (parent, args, context, info) => {
			const { url } = args;

			return getSessionInfoHelper(url);
		},
		getSessions: (parent, args, context, info) => {

		},
	},
	Mutation: {
		_: () => true
	}
}

module.exports = resolvers;