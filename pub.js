import { Publisher as ZmqPublisher } from 'zeromq';
import protobuf from 'protobufjs';

class Publisher {
  constructor(url, protoPath, messageTypeName) {
    this.protoPath = protoPath;
    this.messageTypeName = messageTypeName;
    this.socket = new ZmqPublisher;
    this.socket.bind(url);
    console.log(`Publisher bound to ${url}`);
  }
  
  async sendMessage() {
    const root = await protobuf.load(this.protoPath);
    const MessageType = root.lookupType(this.messageTypeName);
  
    // Create a fake fusedPose message
    const fakeData = {
        orientation: {
          x: 1.23,
          y: 4.56,
          z: 7.89,
          w: 0.12
        },
        // Add other fields as needed
    }
    const errMsg = MessageType.verify(fakeData);
      if (errMsg) {
          console.error('Error:', errMsg);
          return;
      }
    const message = MessageType.create(fakeData);
  
    // Encode the message to a buffer
    const buffer = MessageType.encode(message).finish();
  
    // Send the message
    while (true) {
      await this.socket.send(['', buffer]);
    }
  }
}

const publisher = new Publisher('tcp://127.0.0.1:8799', 'C:/yk/lpfusionhub/FusionHub/Fusion/protobuf/stream_data.proto', 'Fusion.proto.FusedPose');
publisher.sendMessage();