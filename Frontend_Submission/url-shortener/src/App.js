import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Short from './pages/Short';
import Stats from './pages/Stats';
import Redirect from './pages/Redirect';
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Short />} />
          <Route path='/stats' element={<Stats />} />
          <Route path='/:shortcode' element={<Redirect />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
