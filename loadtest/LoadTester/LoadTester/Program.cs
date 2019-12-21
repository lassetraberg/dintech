using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WebSocketSharp;

namespace LoadTester
{
    class Program
    {
        const string apiUrl = "http://localhost:8080/api";
        const string adminUsername = "admin";
        const string youtubeUrl = "https://www.youtube.com/watch?v=pioy8LKcctI";
        const string wsUrl = "ws://localhost:8080/api/session";
        const int duration = 5;


        static void Main(string[] args)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            for (int i = 1; i <= 20; i++)
            {
                var clients = i * 100;
                var averageLatency = TestWebsockets(clients);
                Console.WriteLine($"Clients: {clients}\taverage latency: {averageLatency}");
            }
            Console.WriteLine("Done...");
            Console.ReadLine();
        }

        private static double TestWebsockets(int clientCount)
        {
            var list = new ConcurrentBag<DateTime>();
            var connections = new ConcurrentBag<WebSocket>();

            // 1. Request new session
            var sessionUrl = RequestSession(adminUsername, youtubeUrl);
            Console.WriteLine($"Session url: {sessionUrl}");
            // 2. Admin join session
            var adminWs = GetConnection(wsUrl, sessionUrl, adminUsername);
            adminWs.Connect();

            // 3. Connect clients
            for (int i = 0; i < clientCount; i++)
            {
                var username = i.ToString();
                var client = GetConnection(wsUrl, sessionUrl, username);
                client.OnOpen += (o, e) =>
                {
                    client.OnMessage += (o1, message) =>
                    {
                        var time = DateTime.Now;
                        //new Thread(() =>
                        //{
                        if (message.Data.Contains("command"))
                        {
                            list.Add(time);
                            try
                            {
                                if (connections != null) connections.Add(client);
                            }
                            catch { }
                        }
                        //}).Start();
                    };
                };
                client.OnError += (o, e) =>
                {
                    try
                    {
                        client.Close();
                    }
                    catch { }
                };
                client.Connect();
            }

            // Send command
            var sentAt = DateTime.Now;
            SendCommand(adminWs, new { command = "play" });
            Thread.Sleep(clientCount);

            double totalLatency = 0;
            var finalList = new List<DateTime>();

            foreach (var conn in connections)
            {
                try
                {
                    conn.Close();
                }
                catch { }
            }
            connections = null;
            finalList.AddRange(list.ToList());
            foreach (var dt in finalList)
            {
                var latency = (dt - sentAt).TotalMilliseconds;
                totalLatency += latency;
            }

            GC.Collect();
            var result = totalLatency / finalList.Count();
            return result;
        }

        private static string RequestSession(string username, string youtubeUrl)
        {
            using (var wc = new WebClient())
            {
                var body = JsonConvert.SerializeObject(new
                {
                    username = username,
                    ytUrl = youtubeUrl,
                });
                wc.Headers.Add("Content-Type", "application/json");
                var resp = wc.UploadString($"{apiUrl}/session", body);
                dynamic respData = JsonConvert.DeserializeObject(resp);
                return respData.url;
            }
        }

        private static WebSocket GetConnection(string wsUrl, string sessionUrl, string username)
        {
            var ws = new WebSocket($"{wsUrl}/{sessionUrl}?username={username}");
            return ws;
        }

        private static void SendCommand(WebSocket ws, dynamic body)
        {
            ws.Send(JsonConvert.SerializeObject(body));
        }
    }



    public class Client
    {
        public string Username { get; set; }
        public List<DateTime> Messages { get; set; }

        public Client(string username)
        {
            Username = username;
            Messages = new List<DateTime>();
        }

        public override string ToString()
        {
            return $"{Username}: {Messages.Count}";
        }
    }
}

