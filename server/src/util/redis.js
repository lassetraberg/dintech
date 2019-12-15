const redis = require("async-redis");

const client = redis.createClient({
	host: "127.0.0.1",
	port: 6379
});

const get = async (key) => {
	let session = await client.get(key);

	if (session) {
		session = JSON.parse(session);
	} else {
		session = null;
	}

	return session;
}

const set = (key, value) => {
	return client.set(key, JSON.stringify(value));
}

const del = (key) => {
	return client.del(key);
}

module.exports = {
	get,
	set,
	del
}