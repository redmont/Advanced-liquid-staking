import { useEffect, useState } from 'react';

const INITIAL_PARALLAX_VALUE = 10;

const useParallaxEffect = (
  ref: React.RefObject<HTMLDivElement>,
  initialValue = INITIAL_PARALLAX_VALUE,
) => {
  const [scrollPosition, setScrollPosition] = useState(initialValue);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const scrollPositionOffset =
          (window.scrollY / window.innerHeight) * 100 * 0.25;
        setScrollPosition(scrollPositionOffset + initialValue);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialValue, ref]);

  return scrollPosition;
};

export default useParallaxEffect;
