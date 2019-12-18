const {
	getSessionInfoHelper,
	createNewSession
} = require("../util/helper");
const {
	ApolloError
} = require("apollo-server-express");

const resolvers = {
	Query: {
		getSession: (parent, args, context, info) => {
			const { url } = args;

			return getSessionInfoHelper(url);
		}
	},
	Mutation: {
		createSession: async (parent, args, context, info) => {
			const { ytUrl, username } = args;
			const data = await createNewSession(ytUrl, username);

			console.log(data.url);

			if (data) {
				return data.url;
			} else {
				throw new ApolloError("A with same endpoint has already been created.", "SESSION_EXISTS_ALREADY");
			}
		}
	}
}

module.exports = resolvers;