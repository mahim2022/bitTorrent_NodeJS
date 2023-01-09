import dgram from "dgram";
import { parse } from "url";
import { Buffer } from "buffer";

var getPeers = (torrent, callback) => {
	var socket = dgram.createSocket("udp4");
	var url = parse(torrent.announce.toString("utf8"));
	// 1. send connect request
	udpSend(socket, buildConnReq(), url);
	socket.on(
		//get connnect response
		"message",
		(response = () => {
			if (respType(response) === "connect") {
				// 2. receive and parse connect response
				var connResp = parseConnResp(response);
				//3. send announce req
				var announceReq = buildAnnounceReq(connResp.connectionId);
				udpSend(socket, announceReq, url);
			} else if (respType(response) === "announce") {
				var announceResp = parseAnnounceResp(response);
				callback(announceResp.peers);
			}
		})
	);
};

function udpSend(socket, message, rawUrl, callback = () => {}) {
	const url = urlParse(rawUrl);
	socket.send(message, url.port, url.host, callback);
}

function respType(resp) {
	// ...
}

function buildConnReq() {
	// ...
}

function parseConnResp(resp) {
	// ...
}

function buildAnnounceReq(connId) {
	// ...
}

function parseAnnounceResp(resp) {
	// ...
}
