import { useEffect, useState } from "react";
import { useStdout } from "ink";

/**
 * Returns the current screen size of a terminal
 * @see https://github.com/cameronhunter/ink-monorepo/blob/master/packages/ink-use-stdout-dimensions/src/index.ts
 */
export function useScreenSize() {
  const { stdout } = useStdout();
  const [size, setSize] = useState<[number, number]>([
    stdout.columns,
    stdout.rows,
  ]);
  useEffect(() => {
    const handler = () => setSize([stdout.columns, stdout.rows]);
    stdout.on("resize", handler);
    return () => {
      stdout.off("resize", handler);
    };
  }, [stdout]);

  return size;
}
