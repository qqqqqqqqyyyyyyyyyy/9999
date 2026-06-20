import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import GamePlay from './pages/GamePlay';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/play/:id" element={<GamePlay />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
