import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * 自定义Hook - Intersection Observer
 * 用于实现懒加载和无限滚动
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<Element>();
  
  const { freezeOnceVisible = false, ...observerOptions } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsVisible(entry.isIntersecting);
        
        // 如果设置了freezeOnceVisible且元素可见，停止观察
        if (freezeOnceVisible && entry.isIntersecting) {
          observer.disconnect();
        }
      },
      observerOptions
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [freezeOnceVisible, observerOptions]);

  const observe = (element: Element | null) => {
    if (element) {
      elementRef.current = element;
    }
  };

  return { observe, entry, isVisible };
}

/**
 * 懒加载图片Hook
 */
export function useLazyImage(src: string, fallback: string = '') {
  const [imageSrc, setImageSrc] = useState(fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const { observe, isVisible } = useIntersectionObserver({
    freezeOnceVisible: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (isVisible && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setImageSrc(fallback);
        setIsLoaded(false);
      };
      img.src = src;
    }
  }, [isVisible, src, fallback]);

  return { observe, imageSrc, isLoaded, isVisible };
}