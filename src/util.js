import crypto from "crypto";
import { Buffer } from "buffer";

var id = null;

var genId = () => {
	if (!id) {
		id = crypto.randomBytes(20);
		Buffer.from("-AT0001-").copy(id, 0);
	}
	return id;
};

export { genId };
