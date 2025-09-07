const { v4: uuidv4 } = require('uuid');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let appState = {
  calls: {},
};

app.get('/', (req, res) => {
  console.log("root");
  res.json({success: 'OK'});
});

app.post('/calls', (req, res) => {
  console.log("creating a call");
  const id = uuidv4();
  appState.calls[id] = { 
    id, 
    events: {
      items: [],
    }
  };
  console.log(id);
  res.send(id);
});

app.get('/calls/:id', (req, res) => {
  const id = req.params.id;
  console.log("getting info for a call: ", id);
  const call = appState.calls[id]
  if (call) {
    console.log(call);
    res.json(call);
  } else {
    res.status(404).send('Call not found');
  }
});

app.get('/calls/:id/events', (req, res) => {
  const id = req.params.id;
  console.log("getting info for a call events: ", id);
  const call = appState.calls[id];
  if (call) {
    console.log(call.events);
    res.json(call.events);
  } else {
    res.status(404).send('Call not found');
  }
});

app.post('/calls/:id/events/items', (req, res) => {
  const id = req.params.id;
  const itemRequest = req.body.item;
  console.log("updating events (adding item) to call ", id, itemRequest);
  console.log(req.body);
  console.log('state:', appState.calls)

  if (appState.calls[id]) {
    const call = appState.calls[id];

    if (call.events) {
      call.events.items.push(itemRequest);
    } else {
      call.events = {
        items: [itemRequest],
      };
    }

    console.log('Item added to events');
    res.send("We were able to successfully add the item to the events!");
  } else {
    res.send("We were unable to add the item to the order as the specified call id does not exist.");
  }
});

app.delete('/calls/:id/events', (req, res) => {
  console.log("clearing a call events");
  const id = req.params.id;

  if (appState.calls[id]) {
    const call = appState.calls[id];
    call.events = null;
    res.send("successfully cleared the call's events");
  } else {
    res.status(404).send('Call not found');
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
module.exports = { app, server };
