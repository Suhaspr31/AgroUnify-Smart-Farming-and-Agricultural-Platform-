// Simple SSE broadcaster for important news alerts
const clients = new Set();

function sseHeaders(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write('\n');
}

function addClient(res) {
  clients.add(res);
}

function removeClient(res) {
  clients.delete(res);
}

function sendAlert(alert) {
  const payload = `event: important\ndata: ${JSON.stringify(alert)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (e) {
      // ignore write errors; cleanup later
    }
  }
}

module.exports = { sseHeaders, addClient, removeClient, sendAlert };
