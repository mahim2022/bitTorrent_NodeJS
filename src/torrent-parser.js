import fs from "fs";
import bencode from "bencode";
import crypto from "crypto";
// import bignum from "bignum";
import { Buffer } from "buffer";

var open = (filepath) => {
	return bencode.decode(fs.readFileSync(filepath));
};

var size = (torrent) => {
	// ...
	var size = torrent.info.files
		? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b)
		: torrent.info.length;
	return bignum.toBuffer(size, { size: 8 });
	var buf = Buffer.alloc(8);
	return buf.writeBigInt64BE(BigInt(size));
	// BigInt(size);
};

var infoHash = (torrent) => {
	// ...
	var info = bencode.decode(torrent.info);
	return crypto.createHash("sha1").update(info).digest;
};
// module.exports = { open, size, infoHash };
export { open, size, infoHash };
