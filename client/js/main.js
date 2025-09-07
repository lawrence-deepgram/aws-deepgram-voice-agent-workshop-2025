const audioContextOut = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive", sampleRate: 48000 });
const audioContext = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
let startTime = -1;

window.onload = function () {
  prepareAgentConfig();
  const voice = document.getElementById("voice");
  const model = document.getElementById("model");
  document.getElementById("startConversationBtn").addEventListener("click", () => {
    startConversaton(model, voice);
  });
};

function startConversaton(model, voice) {
  const config = configureSettings(model, voice);
  let ws = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", ["token", "<your-deepgram-api-key-here>"]);
  ws.binaryType = 'arraybuffer';
  
  // Store WebSocket reference for function call responses
  wsConnection = ws;

  ws.onopen = function () {
    console.log("WebSocket connection established.");
    // Send initial config on connection
    ws.send(JSON.stringify(config)); 
    // Send the microphone audio to the websocket
    captureAudio((data)=>{
      ws.send(data);
    });
  };

  ws.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  ws.onmessage = function (event) {
    if (typeof event.data === "string") {
      console.log("Text message received:", event.data);
      // Handle text messages
      handleMessageEvent(event.data);
    } else if (event.data instanceof ArrayBuffer) {
      // Update the animation
      updateBlobSize(0.25);
      // Play the audio
      receiveAudio(event.data);
    } else {
      console.error("Unsupported message format.");
    }
  };

  updateUI();

  updateVoices((voice_selection) => {
    ws.send(JSON.stringify({
      "type": "UpdateSpeak",
      "speak": {
        "provider": {
          "type": "deepgram",
          "model": voice_selection
        }
      }
    }));
  });

  // Now handled through the more flexible Settings structure
    
  updateInstructions((instructions) => {
    ws.send(JSON.stringify({
      "type": "Settings",
      "agent": {
        "think": {
          "prompt": instructions
        }
      }
    }))
  });
}

function updateVoices(callback) {
  document.querySelectorAll(".circle-button").forEach((button) => {
    button.addEventListener("click", function () {
      document
        .querySelector(".circle-button.selected")
        .classList.remove("selected");
      this.classList.add("selected");
      const voice_selection = this.id;
      console.log("Voice selection changed to:", voice_selection);

      callback(voice_selection);
    });
  });
}

function updateInstructions(callback) {
  // Update the instructions when a button is clicked
  document
    .getElementById("updateInstructionsBtn")
    .addEventListener("click", function () {
      let instructions = document.getElementById("instructionsInput").value;
      callback(instructions);
    });
}

function updateQuestions(){
  const itemsDiv = document.querySelector('#items');
  let questions = [
    "Can you schedule a meeting for September 30th 2025 at 10am?",
    "What is the overall deductible for an individual and for a family?",
    "Are there services covered before meeting the deductible? If yes, which services?",
    "Are there other deductibles for specific services? If yes, what are they?",
    "What is the out-of-pocket limit for this plan for both network and out-of-network providers?",
    "What is not included in the out-of-pocket limit?",
    "Will the user pay less if they use a network provider? How can they find a list of network providers?",
    "Does the plan cover prescription drugs?",
    "What is the coverage for preventive care services?",
    "How does the plan handle out-of-network care, and what are the costs associated with that?",
    "Can I keep my current doctor under the new plan?",
    "What is the process for filing a claim, and how long does it typically take to get reimbursed?"
  ];
  questions.forEach((item) => {
    let itemLi = document.createElement('li');
    itemLi.innerHTML = item;
    itemLi.className = 'no-bullets items';
    itemsDiv.appendChild(itemLi);
});
}

function updateUI() {
  document.getElementById("startContainer").style.display = "none";
  document.getElementById("blobCanvas").style.display = "flex";
  document.getElementById("buttonContainer").style.display = "flex";

  animateBlob();
}

function configureSettings(model, voice) {
  const voiceSelection = voice.options[voice.selectedIndex].value;
  const providerAndModel = model.options[model.selectedIndex].value;

  // Configuration settings for the agent
  let config_settings = getStsConfig(state.callID);
  config_settings.agent.think.provider.model = providerAndModel;
  console.log('config_settings', JSON.stringify(config_settings))

  // Update the text area to match the initial instructions
  document.getElementById("instructionsInput").value = config_settings.agent.think.prompt;
  document.getElementById(voiceSelection).classList.add("selected");
  return config_settings;
}

// Store reference to WebSocket for function call responses
let wsConnection = null;

async function handleMessageEvent(data){
  let msgObj = JSON.parse(data);
  if (msgObj["type"] === "UserStartedSpeaking") {
    clearScheduledAudio();
  }
  
  // Handle function calls from the voice agent
  if (msgObj["type"] === "FunctionCallRequest") {
    await handleFunctionCallRequest(msgObj);
    return;
  }
  
  if (!state.callID || state.status === 'sleeping') return;

  // Skip server sync when using client-side only mode
  // const events = await service.getEvents(state.callID);
  // if (events) {
  //     // Consolidate order needed because sometimes server can send back duplicate items
  //     state.events = events;
  // }
  
  // // Update UI with current client-side state
  // updateEventsUI();
}

// Handle function calls from the voice agent
async function handleFunctionCallRequest(functionCallMessage) {
  console.log("Received function call:", functionCallMessage);
  
  const functionName = functionCallMessage.functions?.[0].name;
  const parameters = functionCallMessage.functions?.[0].arguments;
  const functionCallId = functionCallMessage.functions?.[0].id;
  const clientside = functionCallMessage.functions?.[0].client_side;
  
  let result = null;
  let success = false;
  
  try {
    if (clientside && functionName === "add_meeting_client_side") {
      result = await addMeetingClientSide(parameters);
      success = true;
    } else {
      result = `Unknown function: ${functionName}`;
      success = false;
    }
  } catch (error) {
    console.error("Function call error:", error);
    result = `Error executing ${functionName}: ${error.message}`;
    success = false;
  }
  
  // Send function call response back to the voice agent
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    const response = {
      type: "FunctionCallResponse",
      id: functionCallId,
      name: functionName,
      content: result
    };
    
    console.log("Sending function call response:", response);
    wsConnection.send(JSON.stringify(response));
  }
}

// Client-side implementation that mimics the server's add meeting functionality
async function addMeetingClientSide(parameters) {
  console.log("Adding meeting item to client-side state:", parameters);
  const item = JSON.parse(parameters).item;
  
  if (!item) {
    throw new Error("Missing required parameter: item");
  }
  
  if (!state.callID) {
    throw new Error("No active call ID found");
  }
  
  console.log("Adding meeting item to client-side state:", item);
  
  // Initialize events array if it doesn't exist (mimicking server behavior)
  if (!state.events) {
    state.events = [];
  }
  
  // Add the item to the events array
  state.events.push(item);
  
  console.log("state.events after pushing item: ", state.events);
  // Update the UI to show the new item
  updateEventsUI();
  
  console.log("Item added to client-side events");
  return "We were able to successfully add the item to the events!";
}

// Update the UI to display events from client-side state
function updateEventsUI() {
  let eventItems = document.querySelector('#eventItems');
  if (!eventItems) {
    console.warn("eventItems element not found in DOM");
    return;
  }
  
  eventItems.innerHTML = '';
  
  console.log("updateEventsUI - state.events:", state.events);
  if (state.events && state.events.length > 0) {
    state.events.forEach((item) => {
      let itemLi = document.createElement('li');
      itemLi.innerHTML = item;
      itemLi.className = 'no-bullets';
      eventItems.appendChild(itemLi);
    });
  }
}

async function prepareAgentConfig() {
  state.initializedAgent = true;
  try {
    updateQuestions();
    state.callID = "123";
    // state.callID = await service.getCallID();
    let button = document.querySelector('#startConversationBtn');
    button.innerHTML = 'Start Conversation';
    button.removeAttribute('disabled');
  } catch (error) {
    console.error("Config error:", error);
  }
}