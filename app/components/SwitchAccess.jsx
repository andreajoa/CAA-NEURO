"use client";
import { useEffect, useState, useCallback } from "react";

export default function SwitchAccess({ cards, onSelect, enabled, interval = 1500 }) {
  const [focusIndex, setFocusIndex] = useState(0);
  const [scanning, setScanning] = useState(false);

  const select = useCallback(() => {
    if (!scanning || !cards?.length) return;
    onSelect?.(cards[focusIndex]);
  }, [scanning, focusIndex, cards, onSelect]);

  useEffect(() => {
    if (!enabled || !cards?.length) return;

    setScanning(true);
    setFocusIndex(0);

    const timer = setInterval(() => {
      setFocusIndex(i => (i + 1) % cards.length);
    }, interval);

    const handleKey = (e) => {
      if (e.code === "Space" || e.code === "Enter" || e.code === "KeyA") {
        e.preventDefault();
        select();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleKey);
      setScanning(false);
    };
  }, [enabled, cards, interval, select]);

  return { focusIndex, scanning };
}
