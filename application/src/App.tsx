// application/src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Puedes agregar más rutas aquí en el futuro */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
