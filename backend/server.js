const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const Document = require('./Document')
const socketio = require('socket.io')
const io = socketio(process.env.PORT, {cors: {origin: '*'}});

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@text-editor.dogkql5.mongodb.net/?retryWrites=true&w=majority`
try {
	mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	console.log('db connection established')
} catch (error) {
	console.log('db error')
}

const findOrCreateDocument = async (id) => {
	if (id == null) {
		return
	}
	const document = await Document.findById(id)
	if (document) {
		return document
	}
	return await Document.create({ _id: id, data: '' })
}

io.on('connection', (socket) => {
	console.log('socket connection')

	socket.on('get-document', async (documentId) => {
		const document = await findOrCreateDocument(documentId)
		socket.join(documentId)
		socket.emit('load-document', document.data)

		socket.on('send-changes', (delta) => {
			socket.broadcast.to(documentId).emit('receive-changes', delta)
		})

		socket.on('save-document', async (data) => {
			await Document.findByIdAndUpdate(documentId, { data })
		})
	})
})
