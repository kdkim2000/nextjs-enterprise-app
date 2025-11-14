declare module 'react-split' {
  import { ComponentType, CSSProperties, ReactNode } from 'react';

  export interface SplitProps {
    sizes?: number[];
    minSize?: number | number[];
    maxSize?: number | number[];
    expandToMin?: boolean;
    gutterSize?: number;
    gutterAlign?: 'center' | 'start' | 'end';
    snapOffset?: number;
    dragInterval?: number;
    direction?: 'horizontal' | 'vertical';
    cursor?: string;
    gutter?: (index: number, direction: 'horizontal' | 'vertical') => HTMLElement;
    elementStyle?: (
      dimension: 'width' | 'height',
      size: number,
      gutterSize: number,
      index: number
    ) => CSSProperties;
    gutterStyle?: (
      dimension: 'width' | 'height',
      gutterSize: number,
      index: number
    ) => CSSProperties;
    onDrag?: (sizes: number[]) => void;
    onDragStart?: (sizes: number[]) => void;
    onDragEnd?: (sizes: number[]) => void;
    collapsed?: number;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
  }

  const Split: ComponentType<SplitProps>;
  export default Split;
}
