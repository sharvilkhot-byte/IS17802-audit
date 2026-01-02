

import React, { useEffect, useState } from 'react';
// Fix: Changed react-router-dom import to a namespace import to resolve module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoIcon from '../components/LogoIcon';

const SplashScreenSecondary: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const { user, loading } = useAuth();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // This timer ensures the screen is visible for a minimum duration,
    // preventing a jarring flash if auth is very fast.
    const minDisplayTimer = setTimeout(() => {
      if (!loading) {
        setFading(true);
      }
    }, 1500);

    return () => clearTimeout(minDisplayTimer);
  }, [loading]);

  useEffect(() => {
    if (fading) {
      const fadeOutTimer = setTimeout(() => {
        if (user) {
          if (user.attachment_style) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        } else {
          navigate('/auth');
        }
      }, 500); // Match this with transition duration
      return () => clearTimeout(fadeOutTimer);
    }
  }, [fading, user, navigate]);

  return (
    <div className={`flex flex-col items-center justify-center h-full bg-background transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center text-center animate-fade-in">
            <LogoIcon className="mb-6" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-textPrimary px-4">A space to understand yourself better.</h1>
        </div>
         <style>{`
            @keyframes fade-in {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 1.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default SplashScreenSecondary;
