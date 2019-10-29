const helper = {
  allowedStates: ["isPlaying", "offset"],
  wsSendError: (ws, errorMsg) =>
    ws.send(JSON.stringify({ error: { message: errorMsg } }))
};

module.exports = helper;
