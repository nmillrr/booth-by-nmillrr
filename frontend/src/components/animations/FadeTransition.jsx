import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable component for fade in/out transitions
 */
const FadeTransition = ({ 
  show, 
  children, 
  duration = 300,
  className = '',
  enterFrom = 'opacity-0',
  enterTo = 'opacity-100',
  exitFrom = 'opacity-100',
  exitTo = 'opacity-0',
  onExited = () => {}
}) => {
  // State for managing the visibility and animation
  const [isVisible, setIsVisible] = useState(show);
  const [isRendered, setIsRendered] = useState(show);
  const [animationClass, setAnimationClass] = useState(show ? enterTo : exitTo);
  
  useEffect(() => {
    let timeout;
    
    if (show) {
      // Handle fade in
      setIsRendered(true);
      setAnimationClass(enterFrom);
      
      // Trigger animation after a small delay (for the browser to recognize the change)
      timeout = setTimeout(() => {
        setAnimationClass(enterTo);
        setIsVisible(true);
      }, 10);
    } else {
      // Handle fade out
      setAnimationClass(exitFrom);
      
      // Trigger animation
      timeout = setTimeout(() => {
        setAnimationClass(exitTo);
        setIsVisible(false);
      }, 10);
      
      // Remove from DOM after animation completes
      timeout = setTimeout(() => {
        setIsRendered(false);
        onExited();
      }, duration);
    }
    
    return () => clearTimeout(timeout);
  }, [show, duration, enterFrom, enterTo, exitFrom, exitTo, onExited]);
  
  if (!isRendered) return null;
  
  return (
    <div
      className={`transition-all ease-in-out ${animationClass} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

FadeTransition.propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
  className: PropTypes.string,
  enterFrom: PropTypes.string,
  enterTo: PropTypes.string,
  exitFrom: PropTypes.string,
  exitTo: PropTypes.string,
  onExited: PropTypes.func
};

export default FadeTransition;