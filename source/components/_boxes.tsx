import React, { useRef, useState, useEffect } from "react";
import { Box, BoxProps, measureElement } from "ink";
import { useScreenSize } from "./_useScreenSize.js";

// Contains specialized boxes used in the terminal interface

/**
 * A Box that keeps track of its current
 * dimensions when the terminal screen is resized
 */
export const ResponsiveBox: React.FC<
  React.PropsWithoutRef<
    React.PropsWithChildren<
      BoxProps & {
        /** Callback hook that gives the current dimensions of the box */
        onMeasurement?: (dimensions: { width: number; height: number }) => void;
      }
    >
  >
> = ({ onMeasurement, children, ...props }) => {
  const ref = useRef<any>();
  const dimensions = measureResizableElement(ref);

  // Allows the current dimensions to be retrieved
  // using a callback prop
  React.useEffect(() => {
    if (onMeasurement) {
      onMeasurement(dimensions);
    }
  }, [dimensions]);

  return (
    <Box ref={ref} {...props}>
      {children}
    </Box>
  );
};

/**
 * Reusable hook that returns the dimensions of a element
 * when the screen is resized
 */
function measureResizableElement(ref: React.MutableRefObject<any>) {
  const screen = useScreenSize();
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>(screen);

  useEffect(() => {
    if (ref.current) {
      const size = measureElement(ref.current);
      setDimensions(size);
    }
  }, [ref, screen]);

  return dimensions;
}
