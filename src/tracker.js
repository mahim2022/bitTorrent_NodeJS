import dgram from "dgram";
import { parse } from "url";
import { Buffer } from "buffer";
import crypto from "crypto";
import { genId } from "./util.js";

var getPeers = (torrent, callback) => {
	var socket = dgram.createSocket("udp4");
	var url = parse(torrent.announce.toString("utf8"));
	// 1. send connect request
	udpSend(socket, buildConnReq(), url);

	socket.on("message", (response) => {
		if (respType(response) === "connect") {
			console.log("connect");
			// 2. receive and parse connect response
			const connResp = parseConnResp(response);
			// 3. send announce request
			const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
			udpSend(socket, announceReq, url);
		} else if (respType(response) === "announce") {
			console.log("connect");

			// 4. parse announce response
			const announceResp = parseAnnounceResp(response);
			// 5. pass peers to callback
			callback(announceResp.peers);
		}
	});
};

function udpSend(socket, message, rawUrl, callback = () => {}) {
	const url = parse(rawUrl);
	console.log(url);
	// socket.send(message, url.port, url.host, callback);
	socket.send(message, 6681, url.host, callback);
}

function respType(resp) {
	// ...
	const action = resp.readUInt32BE(0);
	if (action === 0) return "connect";
	if (action === 1) return "announce";
}

function buildConnReq() {
	// Offset  Size            Name            Value
	// 0       64-bit integer  connection_id   0x41727101980
	// 8       32-bit integer  action          0 // connect
	// 12      32-bit integer  transaction_id  ? // random
	// 16

	const buf = Buffer.alloc(16); // 2

	// connection id
	buf.writeUInt32BE(0x417, 0); // 3
	buf.writeUInt32BE(0x27101980, 4);
	// action
	buf.writeUInt32BE(0, 8); // 4
	// transaction id
	crypto.randomBytes(4).copy(buf, 12); // 5

	return buf;

	//     First we require the built-in crypto module to help us create a random number for our buffer. We’ll see that in action shortly.

	// Then we create a new empty buffer with a size of 16 bytes since we already know that the entire message should be 16 bytes long.

	// Here we write the the connection id, which should always be 0x41727101980 when writing the connection request. We use the method writeUInt32BE which writes an unsigned 32-bit integer in big-endian format (more info here). We pass the number 0x417 and an offset value of 0. And then again the number 0x27101980 at an offset of 4 bytes.

	// You might be wondering 2 things: what’s with the 0x? and why do we have to split the number into two writes?

	// The 0x indicates that the number is a hexadecimal number, which can be a more conventient representation when working with bytes. Otherwise they’re basically the same as base 10 numbers.

	// The reason we have to write in 4 byte chunks, is that there is no method to write a 64 bit integer. Actually node.js doesn’t support precise 64-bit integers. But as you can see it’s easy to write a 64-bit hexadecimal number as a combination of two 32-bit hexadecimal numbers.

	// Next we write 0 for the action into the next 4 bytes, setting the offset at 8 bytes since just wrote an 8 byte integer. This values should always be 0 for the connection request.

	// For the final 4 bytes we generate a random 4-byte buffer using crypto.randomBytes which is a pretty handy way of creating a random 32-bit integer. To copy that buffer into our original buffer we use the copy method passing in the offset we would like to start writing at.
}

function parseConnResp(resp) {
	// ...
	//resp will be a buffer

	//     Offset  Size            Name            Value
	// 0       32-bit integer  action          0 // connect
	// 4       32-bit integer  transaction_id
	// 8       64-bit integer  connection_id
	// 16
	return {
		action: resp.readUInt32BE(0),
		transactionId: resp.readUInt32BE(4),
		connectionId: resp.readUInt32BE(8),
	};
}

function buildAnnounceReq(connId) {
	//Announce request
	// Offset  Size    Name    Value
	// 0       64-bit integer  connection_id
	// 8       32-bit integer  action          1 // announce
	// 12      32-bit integer  transaction_id
	// 16      20-byte string  info_hash
	// 36      20-byte string  peer_id
	// 56      64-bit integer  downloaded
	// 64      64-bit integer  left
	// 72      64-bit integer  uploaded
	// 80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
	// 84      32-bit integer  IP address      0 // default
	// 88      32-bit integer  key             ? // random
	// 92      32-bit integer  num_want        -1 // default
	// 96      16-bit integer  port            ? // should be betwee
	// 98

	// ...
	const buf = Buffer.allocUnsafe(98);

	// connection id
	connId.copy(buf, 0);
	// action
	buf.writeUInt32BE(1, 8);
	// transaction id
	crypto.randomBytes(4).copy(buf, 12);
	// info hash
	torrentParser.infoHash(torrent).copy(buf, 16);
	// peerId
	genId().copy(buf, 36);
	// downloaded
	Buffer.alloc(8).copy(buf, 56);
	// left
	torrentParser.size(torrent).copy(buf, 64);
	// uploaded
	Buffer.alloc(8).copy(buf, 72);
	// event
	buf.writeUInt32BE(0, 80);
	// ip address
	buf.writeUInt32BE(0, 84);
	// key
	crypto.randomBytes(4).copy(buf, 88);
	// num want
	buf.writeInt32BE(-1, 92);
	// port
	buf.writeUInt16BE(port, 96);

	return buf;
}

function parseAnnounceResp(resp) {
	// ...
	function group(iterable, groupSize) {
		let groups = [];
		for (let i = 0; i < iterable.length; i += groupSize) {
			groups.push(iterable.slice(i, i + groupSize));
		}
		return groups;
	}

	return {
		action: resp.readUInt32BE(0),
		transactionId: resp.readUInt32BE(4),
		leechers: resp.readUInt32BE(8),
		seeders: resp.readUInt32BE(12),
		peers: group(resp.slice(20), 6).map((address) => {
			return {
				ip: address.slice(0, 4).join("."),
				port: address.readUInt16BE(4),
			};
		}),
	};
}

// module.exports = { getPeers };
export { getPeers };
