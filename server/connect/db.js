import mongoose from "mongoose";

const connectMongo = async() => {
    try{
        const connection = await mongoose.connect("mongodb+srv://altcodejatinsaini:sxBjD01dvi2xEwK4@bitbricks.o0ojtjy.mongodb.net/?retryWrites=true&w=majority&appName=bitbricks");
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
		console.log(`Error: ${error.message}`);
		process.exit(1);
	}
}

export default connectMongo;