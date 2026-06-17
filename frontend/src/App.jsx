import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function Home() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <h1>ProjectMarket</h1>
      <p>Платформа для покупки проектов</p>

      {user ? (
        <div>
          <p>Добро пожаловать, {user.fullName}!</p>
          <button onClick={logout} style={{ padding: '5px 10px', cursor: 'pointer' }}>
            Выйти
          </button>
        </div>
      ) : (
        <nav>
          <Link to="/projects">Проекты</Link> |
          <Link to="/login">Вход</Link> |
          <Link to="/register">Регистрация</Link>
        </nav>
      )}
    </div>
  );
}

function Projects() {
  return <h2>Список проектов (скоро)</h2>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
