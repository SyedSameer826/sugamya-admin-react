import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  const scrollToTop = () => {
    // const scrollStep = window.pageYOffset / 50;

    // const scrollAnimation = () => {
    //   const scrollTop = window.pageYOffset - scrollStep;
    //   if (window.pageYOffset <= 0) {
    //     return;
    //   }
    //   window.scroll(0, scrollTop);
    //   window.requestAnimationFrame(scrollAnimation);
    // };
    // scrollAnimation();
    
    window.scrollTo({
      top: 20,
      behavior: 'smooth',
    })
  };

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  return null;
}

export default ScrollToTop;
