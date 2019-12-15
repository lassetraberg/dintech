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
		getSessions: [Session!]!
	}

	type Mutation {
		_: Boolean
	}
`

module.exports = typedefs;