using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp;

namespace LoadTester
{
    class Program
    {
        static void Main(string[] args)
        {
            var apiUrl = "http://localhost:8080/api";
            var adminUsername = "lasse";
            var youtubeUrl = "https://www.youtube.com/watch?v=pioy8LKcctI";
            var wsUrl = "ws://localhost:8080/api/session";

            // Request new session
            string sessionUrl;
            using (var wc = new WebClient())
            {
                var body = JsonConvert.SerializeObject(new
                {
                    username = adminUsername,
                    ytUrl = youtubeUrl,
                });
                var resp = wc.UploadString($"{apiUrl}/session", body);
                dynamic respData = JsonConvert.DeserializeObject(resp);
                sessionUrl = respData.url;
            }

            // Admin join session

            using (var ws = new WebSocket($"{wsUrl}/{sessionUrl}?username={adminUsername}"))
            {
                ws.OnMessage += (sender, e) => Console.WriteLine("asds: " + e.Data);

                ws.Connect();
                ws.Send(JsonConvert.SerializeObject(new
                {
                    command = "play"
                }));
                Console.ReadKey(true);
            }
        }
    }
}

