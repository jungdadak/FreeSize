// types/lucide-react.d.ts

declare module 'lucide-react' {
  import * as React from 'react';

  export interface IconProps extends React.SVGAttributes<SVGElement> {
    size?: number | string;
    color?: string;
  }

  export const Menu: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const ArrowUpLeft: React.FC<IconProps>;
  export const Home: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const LogIn: React.FC<IconProps>;
  export const Plus: React.FC<IconProps>;
  export const Sun: React.FC<IconProps>;
  export const Moon: React.FC<IconProps>;
  export const Upload: React.FC<IconProps>;
  export const Image: React.FC<IconProps>;
  export const ChevronsDown: React.FC<IconProps>;
  export const Camera: React.FC<IconProps>;
  export const Wand2: React.FC<IconProps>;
  export const ArrowLeft: React.FC<IconProps>;
  export const Loader2: React.FC<IconProps>;
  export const Download: React.FC<IconProps>;
  export const Eye: React.FC<IconProps>;
  export const EyeOff: React.FC<IconProps>;
  export const AlertCircle: React.FC<IconProps>;
  export const Info: React.FC<IconProps>;
  export const XCircle: React.FC<IconProps>;
  export const CheckCircle2: React.FC<IconProps>;
  export const CheckCircle: React.FC<IconProps>;
  export const RefreshCw: React.FC<IconProps>;
  export const RocketIcon: React.FC<IconProps>;
  export const Maximize2: React.FC<IconProps>;
  export const Move: React.FC<IconProps>;
  export const Check: React.FC<IconProps>;
  export const ChevronDown: React.FC<IconProps>;
  export const Circle: React.FC<IconProps>;
  export const FileImage: React.FC<IconProps>;
  export const ChevronRight: React.FC<IconProps>;
  export const ChevronLeft: React.Fc<IconProps>;
  export const Activity: React.FC<IconProps>;
  export const AlertTriangle: React.FC<IconProps>;
  // 추가적인 아이콘이 필요하면 여기에 선언하세요.
}
