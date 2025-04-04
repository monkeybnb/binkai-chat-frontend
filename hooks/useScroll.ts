import {
  type UIEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const useScroll = ({ status }: { status: string }) => {
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isAtTop, setIsAtTop] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hideScroll, setHideScroll] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
  }, []);

  const scrollToTop = useCallback(() => {
    if (messagesStartRef.current)
      messagesStartRef.current.scrollIntoView({ behavior: "instant" });
  }, []);

  useEffect(() => {
    if (status === "GENERATING" && isAtBottom) {
      intervalRef.current = setInterval(() => {
        scrollToBottom();
      }, 200);
    } else {
      intervalRef.current && clearInterval(intervalRef.current);
    }
  }, [status, isAtBottom, scrollToBottom]);

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback((e) => {
    const target = e.target as HTMLDivElement;
    const nearBottom = target.scrollTop > -400;

    const bottom = target.scrollTop === 0;
    const top =
      Math.round(target.scrollHeight) - Math.round(target.scrollTop) ===
      Math.round(target.clientHeight);

    setHideScroll(nearBottom);
    setIsAtBottom(bottom);
    setIsAtTop(top);
  }, []);

  return {
    status,
    messagesStartRef,
    messagesEndRef,
    hideScroll,
    isAtTop,
    isAtBottom,
    handleScroll,
    scrollToTop,
    scrollToBottom,
  };
};
