import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { v4 } from 'uuid'

import './App.css'
import TextEditor from './components/TextEditor'
import Sidebar from './components/Sidebar'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					exact
					path='/'
					element={<Navigate to={`/documents/${v4()}`} />}
				/>
				<Route path='/documents/:id' element={<TextEditor />} />
        <Route path='*' element={<Navigate to='/' />} />
			</Routes>
			<Sidebar />
		</BrowserRouter>
	)
}

export default App
