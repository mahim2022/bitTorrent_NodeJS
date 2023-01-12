import net from "net";
import { Buffer } from "buffer";
import { getPeers } from "./tracker";
//how to connect tcp //

// var socket = new net.Socket();

// socket.on("error", console.log);
// socket.connect(port, ip, () => {
// 	socket.write(Buffer.from("hello world"));
// });
// socket.on("data", (responseBuffer) => {
// 	console.log(responseBuffer);
// });

var torrent = (torrent) => {
	getPeers(torrent, (peers) => {
		peers.forEach((peer) => download(peer));
	});
};

var download = (peer) => {
	const socket = net.Socket();
	socket.on("error", console.log);
	socket.connect(peer.port, peer.ip, () => {
		// socket.write(...) write a message here
	});
	socket.on("data", (data) => {
		// handle response here
	});
};
