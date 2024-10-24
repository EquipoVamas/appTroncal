import { io } from 'socket.io-client'

const socket = io("wss://socket.vl.pe", {
    reconnectionDelayMax: 10000,
    auth: {
        token: "123"
    },
    query: {
        "nameRoom": "VAMAS"
    }
});

export default socket;