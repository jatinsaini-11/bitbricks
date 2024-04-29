import dotenv from "dotenv";

dotenv.config();

const verifyId = (id) => {
	if (id.match(/^[0-9a-fA-F]{24}$/)) {
		return true;
	}
	return false;
};

const findPropertyInPropertyArray = (property, pId) => {
	property.find((id) => {
		return id.toString() === pId;
	});

	return -1;
};

const getIndexOfProperty = (property, pId) => {
	let index = property.indexOf(pId);
	return index;
};

export { verifyId , findPropertyInPropertyArray , getIndexOfProperty };