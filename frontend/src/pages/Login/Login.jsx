import React from 'react';
import { motion } from 'framer-motion';
import { FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const { loginWithVK } = useAuth();

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-header">
          <img src="/logo.svg" alt="RuStore" className="login-logo" />
          <h1>Добро пожаловать в RuStore</h1>
          <p>Войдите, чтобы получить персональные рекомендации</p>
        </div>

        <motion.button
          className="btn-vk-login"
          onClick={loginWithVK}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="vk-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.91 14.53h-1.59c-.67 0-.87-.53-2.07-1.74-1.05-1-1.51-1.13-1.77-1.13-.37 0-.47.1-.47.58v1.58c0 .43-.13.68-1.27.68-1.87 0-3.95-1.13-5.41-3.24-2.19-3.04-2.78-5.32-2.78-5.78 0-.26.1-.5.58-.5h1.59c.43 0 .6.2.76.65.85 2.37 2.27 4.44 2.86 4.44.22 0 .32-.1.32-.65v-2.52c-.07-1.23-.72-1.33-.72-1.77 0-.2.17-.4.44-.4h2.49c.37 0 .5.2.5.63v3.4c0 .37.17.5.27.5.22 0 .4-.13.82-.54 1.26-1.42 2.16-3.62 2.16-3.62.12-.26.32-.5.75-.5h1.59c.48 0 .58.24.48.63-.17.94-2.18 3.76-2.18 3.76-.18.3-.25.43 0 .76.18.25.77.75 1.16 1.21.71.81 1.25 1.49 1.4 1.96.15.47-.08.71-.55.71z"/>
          </svg>
          Войти через VK ID
        </motion.button>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span>Персональные рекомендации</span>
          </div>
          <div className="feature">
            <span className="feature-icon">❤️</span>
            <span>Список желаемого</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>История установок</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
