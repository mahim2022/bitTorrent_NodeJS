"use strict";
// var fs = require("fs");
// var bencode = require("bencode").decode;
import fs from "fs";
import bencode from "bencode";
var torrent = bencode.decode(
	fs.readFileSync(
		"./[TorrentBD]Modern Family S01-S11 720p BlurayWEBRip x265 AAC - Mixed.torrent"
	)
);
