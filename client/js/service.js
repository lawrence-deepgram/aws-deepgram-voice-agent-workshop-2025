const service = {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
 
    getCallID: async function() {
      console.log("BASE_URL", BASE_URL);
      const callID = await fetch(`${BASE_URL}/calls`, {
        method: "POST",
        headers: this.headers,
      });
      if (!callID.ok) {
        const errorText = await callID.text();
        console.error("Failed to get call ID:", callID.status, errorText);
        throw new Error(`Failed to get call ID: ${callID.status} ${errorText}`);
      }
  
      const callIDText = await callID.text();
      return callIDText;
    },
  
  getEvents: async function(callID) {
    console.log("BASE_URL", BASE_URL);
    
    // Wait 500ms before making the fetch request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const order = await fetch(`${BASE_URL}/calls/${callID}/events`, {
      method: "GET",
      headers: this.headers,
    });
    if (!order.ok) {
      const errorText = await order.text();
      console.error("Failed to get events:", order.status, errorText);
      throw new Error(`Failed to get events: ${order.status} ${errorText}`);
    }

    const eventsJSON = await order.json();
    return eventsJSON.items;
  }
}