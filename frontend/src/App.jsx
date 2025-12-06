import React, { useState, useEffect } from 'react';
import WeeklyScheduler from './components/WeeklyScheduler';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);

  // 1. 初始化時，檢查 localStorage 有沒有存過名字
  useEffect(() => {
    const savedName = localStorage.getItem('scheduler_username');
    if (savedName) {
      setUser(savedName);
    }
  }, []);

  // 2. 登入處理
  const handleLogin = (name) => {
    localStorage.setItem('scheduler_username', name); // 記在瀏覽器
    setUser(name);
  };

  // 3. 登出處理
  const handleLogout = () => {
    localStorage.removeItem('scheduler_username');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      { !user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <WeeklyScheduler username={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;