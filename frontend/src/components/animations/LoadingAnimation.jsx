import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Fun loading animation with rotating emojis and microcopy
 */
const LoadingAnimation = ({ 
  isLoading, 
  progress = null, 
  message = 'Loading',
  className = ''
}) => {
  // Emoji sequence for the animation
  const emojis = ['✨', '🌟', '💫', '⚡️', '🔮', '🪄'];
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  
  // Fun loading messages
  const loadingMessages = [
    'Making your magic happen',
    'Sprinkling pixie dust',
    'Brewing your masterpiece',
    'Applying digital magic',
    'Enhancing your moment',
    'Beautifying your image'
  ];
  
  const [currentMessage, setCurrentMessage] = useState(message);
  const [dots, setDots] = useState('');
  
  // Rotate through emojis
  useEffect(() => {
    if (!isLoading) return;
    
    const emojiInterval = setInterval(() => {
      setCurrentEmojiIndex((prevIndex) => (prevIndex + 1) % emojis.length);
    }, 400);
    
    return () => clearInterval(emojiInterval);
  }, [isLoading, emojis.length]);
  
  // Update the loading message
  useEffect(() => {
    if (!isLoading) return;
    
    // Update the message every 3 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 3000);
    
    return () => clearInterval(messageInterval);
  }, [isLoading, loadingMessages]);
  
  // Animate the dots
  useEffect(() => {
    if (!isLoading) return;
    
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    
    return () => clearInterval(dotsInterval);
  }, [isLoading]);
  
  if (!isLoading) return null;
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Animated emoji */}
      <div className="text-4xl animate-bounce mb-4">
        {emojis[currentEmojiIndex]}
      </div>
      
      {/* Loading message */}
      <div className="text-center mb-2 text-lg font-medium">
        {currentMessage}{dots}
      </div>
      
      {/* Progress bar (if progress is provided) */}
      {progress !== null && (
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};

LoadingAnimation.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  progress: PropTypes.number,
  message: PropTypes.string,
  className: PropTypes.string
};

export default LoadingAnimation;