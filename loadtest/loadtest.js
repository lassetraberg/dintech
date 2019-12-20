const request = require('request');
const WebSocketClient = require('websocket').client;

// Create and retrieve new session
const adminUsername = 'lasse';
console.log('Admin creating session...');
request.post('http://localhost:8080/api/session', {
    headers: {
        'Content-Type': 'application/json',
    },
    json: {
        username: adminUsername,
        ytUrl: 'https://www.youtube.com/watch?v=pioy8LKcctI',
    }
}, (error, res, body) => {
    if (error) {
        console.log(error);
        return;
    }
    console.log(`Status Code: ${res.statusCode}. Admin succesfully created session.`);
    console.log(`Session Unique URL: ${body.url}`);
    console.log('Admin establishes Websocket connection...')
    // Admin join session
    const wsUrl = `ws://localhost:8080/api/session/${body.url}/?username=`;
    const connection = new WebSocketClient();
    connection.on('connect', (connection) => {
        console.log('Admin connected to session');
        connection.on('error', (error) => console.log(`Connection Error: ${error.toString()}`));
        connection.on('close', () => console.log('Connection closed.'));
        connection.on('message', (message) => {
            //console.log(`Received: '${message.utf8Data}'`);
        });

        function play() {
            if (connection.connected) {
                const command = {
                    command: "play"
                };
                connection.sendUTF(JSON.stringify(command));
                setTimeout(pause, 2000);
            }
        }

        function pause() {
            if (connection.connected) {
                const command = {
                    command: "pause",
                    offset: "40"
                };
                connection.sendUTF(JSON.stringify(command));
                const command2 = {
                    command: "play"
                };
                connection.sendUTF(JSON.stringify(command2));
                setTimeout(seekTo, 2000);
            }
        }

        function seekTo() {
            if (connection.connected) {
                const command = {
                    command: "seekTo",
                    offset: "160"
                };
                connection.sendUTF(JSON.stringify(command));
                setTimeout(play, 2000);
            }
        }
        setTimeout(play, 50);

        // Load Test
        var arrivalRate = 1000; // in ms. Every second, add 1 users
        const rampTo = 1 // in ms. Ramp it up to 1000 users every second
        console.log('Load testing session...');

        function spawnClient() {
            var connectTimeStart;
            var connectTimeEnd;

            const clientUsername = Math.round(Math.random() * 1000000).toString();
            const connection = new WebSocketClient();
            connection.on('connect', (connection) => {
                connectTimeEnd = new Date().getMilliseconds();
                console.log(`New client ${clientUsername} connected!`)
                const time = connectTimeEnd - connectTimeStart;
                console.log(time);
                connection.on('message', (message) => {
                    //console.log(`${clientUsername} received: '${message.utf8Data}'`);
                });
            });
            connectTimeStart = new Date().getMilliseconds();
            connection.connect(wsUrl + clientUsername);
            arrivalRate = arrivalRate > rampTo ? arrivalRate - 10 : rampTo;
            setTimeout(spawnClient, arrivalRate);
        }
        spawnClient();

    });
    // Run the test.
    connection.connect(wsUrl + adminUsername);

});