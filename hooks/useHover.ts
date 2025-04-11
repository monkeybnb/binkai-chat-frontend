import { useEffect, useRef, useState } from 'react';

export default function useHover() {
  const [isHover, setIsHover] = useState<boolean>(false);
  const refWrapper = useRef<any>(null);

  const handleMouseOver = () => setIsHover(true);
  const handleMouseOut = () => setIsHover(false);

  useEffect(() => {
    const node = refWrapper.current;
    if (node) {
      node.addEventListener('mouseenter', handleMouseOver);
      node.addEventListener('mouseleave', handleMouseOut);
      return () => {
        node.removeEventListener('mouseenter', handleMouseOver);
        node.removeEventListener('mouseleave', handleMouseOut);
      };
    }
  }, [refWrapper]);

  return { refWrapper, isHover };
}
