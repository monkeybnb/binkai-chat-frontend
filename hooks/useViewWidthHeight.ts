import { useEffect, useState } from "react";

export function useViewWidth() {
  const [viewWidth, setViewWidth] = useState<number>(0);

  function viewWidthHandler() {
    setViewWidth(window.innerWidth);
  }

  useEffect(() => {
    setViewWidth(window.innerWidth);
    window.addEventListener("resize", viewWidthHandler);

    return function () {
      window.removeEventListener("resize", viewWidthHandler);
    };
  }, []);

  return viewWidth;
}

export function useViewHeight() {
  const [viewHeight, setViewHeight] = useState<number>(0);

  function viewHeightHandler() {
    setViewHeight(window.innerHeight);
  }

  useEffect(() => {
    setViewHeight(window.innerHeight);
    window.addEventListener("resize", viewHeightHandler);

    return function () {
      window.removeEventListener("resize", viewHeightHandler);
    };
  }, []);

  return viewHeight;
}
