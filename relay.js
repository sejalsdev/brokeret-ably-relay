const WebSocket = require("ws");
function connectBrokeret() {
  console.log("Connecting to Brokeret...");

  ws = new WebSocket(BROKERET_WS, {
    headers: {
      Authorization: `Bearer ${BROKERET_API_KEY}`
    }
  });

  ws.on("open", () => {
    console.log("Connected to Brokeret");

    ws.send(
      JSON.stringify({
        action: "subscribe",
        symbols: [
          "EURUSD",
          "GBPUSD",
          "USDJPY",
          "XAUUSD",
          "BTCUSD",
          "ETHUSD"
        ]
      })
    );

    console.log("Subscribed to symbols");
  });

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (!data.symbol) return;

      console.log("Price:", data.symbol, data.bid, data.ask);

      const channel = ably.channels.get(`prices:${data.symbol}`);

      await channel.publish("tick", {
        symbol: data.symbol,
        bid: data.bid,
        ask: data.ask,
        timestamp: data.timestamp || Date.now()
      });
    } catch (err) {
      console.error("Message Error:", err);
    }
  });

  ws.on("close", () => {
    console.log("Brokeret disconnected. Reconnecting in 5 seconds...");
    setTimeout(connectBrokeret, 5000);
  });

  ws.on("error", (err) => {
    console.error("WebSocket Error:", err.message);
  });
}

connectBrokeret();
