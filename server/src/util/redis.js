const redis = require("redis");

// Create Redis clients
const client = redis.createClient("6379", "redis");
const publisher = redis.createClient("6379", "redis");
const subscriber = redis.createClient("6379", "redis");

module.exports = {
    client,
    publisher,
    subscriber
}

