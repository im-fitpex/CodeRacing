import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import './Onboarding.css';

const onboardingSteps = [
  {
    id: 1,
    title: 'Добро пожаловать в RuStore',
    description: 'Откройте для себя мир российских приложений и игр',
    image: '/onboarding/welcome.svg',
    highlight: null,
  },
  {
    id: 2,
    title: 'Персональные рекомендации',
    description: 'Получайте умные рекомендации на основе ваших интересов',
    image: '/onboarding/recommendations.svg',
    highlight: 'Система анализирует ваши предпочтения',
  },
  {
    id: 3,
    title: 'Категории и фильтры',
    description: 'Находите нужные приложения быстро с помощью удобных категорий',
    image: '/onboarding/categories.svg',
    highlight: 'Нажмите на категорию для фильтрации',
  },
  {
    id: 4,
    title: 'Безопасные установки',
    description: 'Все приложения проверены и безопасны для установки',
    image: '/onboarding/security.svg',
    highlight: 'Официальная площадка VK',
  },
];

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="onboarding-step"
          >
            <div className="onboarding-image">
              <img src={step.image} alt={step.title} />
            </div>

            <div className="onboarding-text">
              <h1 className="onboarding-title">{step.title}</h1>
              <p className="onboarding-description">{step.description}</p>
              {step.highlight && (
                <div className="onboarding-highlight">
                  <FiCheck className="check-icon" />
                  <span>{step.highlight}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="onboarding-footer">
          <div className="progress-dots">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            ))}
          </div>

          <div className="onboarding-actions">
            <button className="btn-skip" onClick={skipOnboarding}>
              Пропустить
            </button>
            <button className="btn-next" onClick={nextStep}>
              {currentStep === onboardingSteps.length - 1 ? 'Начать' : 'Далее'}
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
