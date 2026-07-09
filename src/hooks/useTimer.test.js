import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimer } from "./useTimer.js";

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with the given seconds and is not running", () => {
    const { result } = renderHook(() => useTimer(20, () => {}));
    expect(result.current.seconds).toBe(20);
    expect(result.current.running).toBe(false);
  });

  it("counts down once started", () => {
    const { result } = renderHook(() => useTimer(5, () => {}));

    act(() => result.current.start());
    expect(result.current.running).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.seconds).toBe(4);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.seconds).toBe(2);
  });

  it("stops counting down when stop() is called", () => {
    const { result } = renderHook(() => useTimer(5, () => {}));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.seconds).toBe(4);

    act(() => result.current.stop());
    expect(result.current.running).toBe(false);

    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.seconds).toBe(4); // unchanged, timer is stopped
  });

  it("calls onExpire exactly once when it reaches zero", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useTimer(2, onExpire));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(2000));

    expect(result.current.seconds).toBe(0);
    expect(result.current.running).toBe(false);
    expect(onExpire).toHaveBeenCalledTimes(1);

    // Timer should not keep firing after expiry
    act(() => vi.advanceTimersByTime(5000));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("reset() restores the initial seconds and stops the timer", () => {
    const { result } = renderHook(() => useTimer(10, () => {}));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.seconds).toBe(6);

    act(() => result.current.reset());
    expect(result.current.seconds).toBe(10);
    expect(result.current.running).toBe(false);
  });

  it("reset(newSeconds) overrides the initial value", () => {
    const { result } = renderHook(() => useTimer(10, () => {}));
    act(() => result.current.reset(15));
    expect(result.current.seconds).toBe(15);
  });

  it("always calls the latest onExpire callback, even if it changes after start()", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useTimer(1, cb),
      { initialProps: { cb: firstCallback } }
    );

    act(() => result.current.start());
    rerender({ cb: secondCallback }); // swap the callback while running

    act(() => vi.advanceTimersByTime(1000));

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("exposes a progress ratio between 0 and 1", () => {
    const { result } = renderHook(() => useTimer(10, () => {}));
    expect(result.current.progress).toBe(1);

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.progress).toBe(0.5);
  });
});
