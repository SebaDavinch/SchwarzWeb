declare module "react-responsive-masonry" {
  import { ComponentType, ReactNode } from "react";

  interface ResponsiveMasonryProps {
    columnsCountBreakPoints?: Record<number, number>;
    children?: ReactNode;
    className?: string;
  }

  interface MasonryProps {
    columnsCount?: number;
    gutter?: string;
    children?: ReactNode;
    className?: string;
  }

  export const ResponsiveMasonry: ComponentType<ResponsiveMasonryProps>;
  const Masonry: ComponentType<MasonryProps>;
  export default Masonry;
}
