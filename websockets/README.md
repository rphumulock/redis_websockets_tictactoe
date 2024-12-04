# Basic WebSocket protocol

### Steps

1. **Handshake**:

   - The server handles the WebSocket handshake manually using the HTTP `Upgrade` header.

2. **Messaging**:

   - Each incoming message is parsed using the WebSocket frame structure.
   - Messages are broadcast to all connected clients.

3. **Client Management**:

   - Keeps track of all connected clients.
   - Removes clients from the list on disconnection.

4. **Simple Echo/Broadcast**:
   - Messages sent by one client are broadcast to all connected clients.

---

### **How to Test**

#### **1. Start the Server**

```bash
node server.js
```

#### **2. Connect Using a WebSocket Client**

You can test this with a WebSocket client library, browser console, or tools like `wscat`.

### Using **Browser Console**:

To send messages from the browser to your raw WebSocket server, you can use the **native WebSocket API** built into modern browsers.

Here’s how you can do it step by step:

---

### 1. Open the Browser Console

### 2. Create a WebSocket Connection

Use the following code snippet in the browser console to connect to your WebSocket server:

```javascript
const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
  console.log("Connected to WebSocket server");
};

ws.onmessage = (event) => {
  console.log("Message from server:", event.data);
};

ws.onclose = () => {
  console.log("WebSocket connection closed");
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};
```

This will establish a WebSocket connection to your server running on `ws://localhost:3000`.

---

### 3. Send Messages to the Server

Once the WebSocket connection is open, you can send messages using the `.send()` method:

#### **Send a Simple Text Message**

#### **Send a JSON Message**

If your server expects structured data, you can send a JSON string:

```javascript
ws.send(JSON.stringify({ type: "greet", message: "Hello from the browser!" }));

ws.send(
  JSON.stringify({ type: "broadcast", message: "Hello from the browser!" })
);
```

---

### 4. Receive Messages from the Server

The `ws.onmessage` handler will log any message received from the server. For example, if the server echoes messages back, you will see something like this in the console:

```
Message from server: Echo: Hello from the browser!
```

---

### **5. Close the Connection**

If you want to manually close the WebSocket connection:

```javascript
ws.close();
```

You’ll see the `onclose` handler fire:

```
WebSocket connection closed
```
