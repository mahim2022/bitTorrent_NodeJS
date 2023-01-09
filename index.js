"use strict";
// var fs = require("fs");
// var bencode = require("bencode").decode;
import fs from "fs";
import bencode from "bencode";
import dgram from "dgram";
import { Buffer } from "buffer";
import { parse } from "url";
var torrent = bencode.decode(
	fs.readFileSync(
		"./[TorrentBD]Modern Family S01-S11 720p BlurayWEBRip x265 AAC - Mixed.torrent"
	)
);

var url = parse(torrent.announce.toString("utf8"));

var socket = dgram.createSocket("udp4");
var myMsg = Buffer.from("hello", "utf8");

socket.send(myMsg, url.port, url.host, () => {});

socket.on("message", () => {
	console.log("msg is", msg);
});

// console.log(torrent.announce.toString("utf8"));
// console.log(url);
