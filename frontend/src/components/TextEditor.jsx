import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import 'quill/dist/quill.snow.css'
import Quill from 'quill'
import { io } from 'socket.io-client'

const TextEditor = () => {
	const [socket, setSocket] = useState()
	const [quill, setQuill] = useState()
	const { id: documentId } = useParams()

	const TOOLBAR_OPTIONS = [
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		[{ font: [] }],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['bold', 'italic', 'underline'],
		[{ color: [] }, { background: [] }],
		[{ script: 'sub' }, { script: 'super' }],
		[{ align: [] }],
		['image', 'blockquote', 'code-block'],
		['clean'],
	]

  useEffect(() => {
    const s = io(process.env.REACT_APP_BACKEND_URL)
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

	const quillRef = useCallback((element) => {
		if (element == null) {
			return
		}
		element.innerHTML = ''
		const editor = document.createElement('div')
		element.append(editor)
		const q = new Quill(editor, {
			theme: 'snow',
			modules: { toolbar: TOOLBAR_OPTIONS },
		})
		setQuill(q)
		q.disable()
		q.setText('loading...')
	}, [])

	useEffect(() => {
		if (socket == null || quill == null) {
			return
		}
		const handler = (delta, oldDelta, source) => {
			if (source !== 'user') return
			socket.emit('send-changes', delta)
		}
		quill.on('text-change', handler)

		return () => {
			quill.off('text-change', handler)
		}
	}, [socket, quill])

	useEffect(() => {
		if (socket == null || quill == null) {
			return
		}

		const handler = (delta) => {
			quill.updateContents(delta)
		}
		socket.on('receive-changes', handler)

		return () => {
			socket.off('receive-changes', handler)
		}
	}, [socket, quill])

	useEffect(() => {
		if (socket == null || quill == null) {
			return
		}

		socket.emit('get-document', documentId)

		socket.once('load-document', (document) => {
			quill.setContents(document)
			quill.enable()
		})
	}, [socket, quill, documentId])

	const SAVE_INTERVAL_MS = 2000
	useEffect(() => {
		if (socket == null || quill == null) {
			return
		}

		const interval = setInterval(() => {
			socket.emit('save-document', quill.getContents())
		}, SAVE_INTERVAL_MS)

		return () => {
			clearInterval(interval)
		}
	}, [socket, quill])

	return <div className='container' ref={quillRef}></div>
}

export default TextEditor
