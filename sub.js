import { Subscriber as ZmqSubscriber } from 'zeromq';
import protobuf from 'protobufjs';

class Subscriber {
    constructor(url, protoPath, messageTypeName) {
        this.socket = new ZmqSubscriber;
        this.protoPath = protoPath;
        this.messageTypeName = messageTypeName;

        // Connect to the ZMQ publisher
        this.socket.connect(url);

        // Subscribe to all messages
        this.socket.subscribe('');
        console.log(`Subscriber connected to ${url}`);
    }

    async receiveMessage() {
        const root = await protobuf.load(this.protoPath);
        // To check the structure of the proto structure
        // const protoStructure = root.toJSON();
        // console.log(JSON.stringify(protoStructure, null, 2));
        // return;
        const MessageType = root.lookupType(this.messageTypeName);

        for await (let msg of this.socket) {
            msg = msg[0];
            // console.log('Raw message:', msg);
            if (msg) {
                const message = MessageType.decode(new Uint8Array(msg));
                const numberValue = message.fusedPose.timestamp.toNumber();
                console.log(numberValue);
            }
        }
    }
}

const subscriber = new Subscriber('tcp://localhost:8799', 'C:/yk/lpfusionhub/FusionHub/Fusion/protobuf/stream_data.proto', 'Fusion.proto.StreamData');
subscriber.receiveMessage();