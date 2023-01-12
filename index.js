"use strict";
// var fs = require("fs");
// var bencode = require("bencode").decode;
import fs from "fs";
import bencode from "bencode";
import { getPeers } from "./src/tracker.js";
import { open } from "./src/torrent-parser.js";
import {} from "./src/download.js";

const torrent = open(process.argv[2]);

getPeers(torrent, (peers) => {
	console.log("list of peers", peers);
});

download(torrent);
