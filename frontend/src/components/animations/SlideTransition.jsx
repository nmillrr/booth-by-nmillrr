import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Direction options for the slide transition
 */
export const SLIDE_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
};

/**
 * A reusable component for slide transitions
 */
const SlideTransition = ({ 
  show, 
  children, 
  duration = 300,
  distance = '100%',
  direction = SLIDE_DIRECTIONS.UP,
  className = '',
  onExited = () => {}
}) => {
  // State for managing the visibility and animation
  const [isVisible, setIsVisible] = useState(show);
  const [isRendered, setIsRendered] = useState(show);
  
  // Determine transform values based on direction
  const getTransformValue = (isVisible, direction) => {
    if (isVisible) return 'translate(0, 0)';
    
    switch (direction) {
      case SLIDE_DIRECTIONS.UP:
        return `translate(0, ${distance})`;
      case SLIDE_DIRECTIONS.DOWN:
        return `translate(0, -${distance})`;
      case SLIDE_DIRECTIONS.LEFT:
        return `translate(${distance}, 0)`;
      case SLIDE_DIRECTIONS.RIGHT:
        return `translate(-${distance}, 0)`;
      default:
        return `translate(0, ${distance})`;
    }
  };
  
  // Get initial transform
  const [transform, setTransform] = useState(getTransformValue(show, direction));
  
  useEffect(() => {
    let timeout;
    
    if (show) {
      // Handle slide in
      setIsRendered(true);
      setTransform(getTransformValue(false, direction));
      
      // Trigger animation after a small delay
      timeout = setTimeout(() => {
        setTransform(getTransformValue(true, direction));
        setIsVisible(true);
      }, 10);
    } else {
      // Handle slide out
      setTransform(getTransformValue(true, direction));
      
      // Trigger animation
      timeout = setTimeout(() => {
        setTransform(getTransformValue(false, direction));
        setIsVisible(false);
      }, 10);
      
      // Remove from DOM after animation completes
      timeout = setTimeout(() => {
        setIsRendered(false);
        onExited();
      }, duration);
    }
    
    return () => clearTimeout(timeout);
  }, [show, duration, direction, distance, onExited]);
  
  if (!isRendered) return null;
  
  return (
    <div
      className={`transition-all ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ 
        transform,
        transitionDuration: `${duration}ms` 
      }}
    >
      {children}
    </div>
  );
};

SlideTransition.propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
  distance: PropTypes.string,
  direction: PropTypes.oneOf(Object.values(SLIDE_DIRECTIONS)),
  className: PropTypes.string,
  onExited: PropTypes.func
};

export default SlideTransition;