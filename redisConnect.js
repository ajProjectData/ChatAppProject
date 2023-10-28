const redis = require("redis")

// function redisConnection() {
    const redisClient = redis.createClient({ url: 'redis://127.0.0.1:6379' })
    redisClient.connect()
    redisClient.on('error', (error) => {
        console.error("Redis error-->", error);
    });
    redisClient.on('connect', () => {
        console.log("Redis Connected");
    });
// }

module.exports = redisClient
