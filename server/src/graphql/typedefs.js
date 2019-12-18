const { gql } = require("apollo-server-express")

const typedefs = gql`
	type Session {
		usernames: [String!]!
		totalClients: Int!
		admin: String!
		ytUrl: String!
	}

	type Query {
		getSession(url: String!): Session
	}

	type Mutation {
		createSession(ytUrl: String!, username: String!): String
	}
`

module.exports = typedefs;