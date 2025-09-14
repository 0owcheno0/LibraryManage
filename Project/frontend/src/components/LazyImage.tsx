import React from 'react';
import { Skeleton } from 'antd';
import { useLazyImage } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  placeholder?: React.ReactNode;
}

/**
 * 懒加载图片组件
 * 使用Intersection Observer API实现图片懒加载
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback = '/images/placeholder.png',
  className,
  style,
  width,
  height,
  placeholder
}) => {
  const { observe, imageSrc, isLoaded, isVisible } = useLazyImage(src, fallback);

  return (
    <div 
      ref={observe}
      className={className}
      style={{ 
        ...style, 
        width, 
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {!isVisible || !isLoaded ? (
        placeholder || (
          <Skeleton.Image 
            style={{ width, height }}
            active
          />
        )
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease-in-out'
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};