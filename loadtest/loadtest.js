var request = require('request');


// HTTP Post Options
var headers = {
    'Content-Type':     'application/json'
}
var options = {
    url: 'http://localhost:8080/api/session',
    method: 'POST',
    headers: headers,
    form: {'username': 'lasse', 'ytUrl': 'https://www.youtube.com/watch?v=pioy82KcctI'}
}

// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body)
    }
});

// const adminUsername = 'lasse';
// const url = `ws://localhost:8080/api/session/${session}/?username=`;

// const connection = new WebSocket(url + adminUsername);
// connection.onopen = () => {
//     console.log("Connection established!");
// }