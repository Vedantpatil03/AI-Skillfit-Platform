import { useEffect, useMemo, useRef, useState } from "react";

function pickBestMimeType() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4" // often NOT supported by MediaRecorder; fallback check
  ];
  for (const t of candidates) {
    // eslint-disable-next-line no-undef
    if (window.MediaRecorder?.isTypeSupported?.(t)) return t;
  }
  return "";
}

export default function VideoRecorder({
  onVideoChange,
  maxSeconds = 180,
  className = ""
}) {
  const liveVideoRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const stopTimerRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | ready | recording | stopped | error
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [recordedBlob, setRecordedBlob] = useState(null);

  const canUseMedia =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== "undefined" &&
    !!window.MediaRecorder;

  const mimeType = useMemo(() => pickBestMimeType(), []);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (stopTimerRef.current) clearInterval(stopTimerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopStream() {
    const s = streamRef.current;
    if (s) {
      for (const t of s.getTracks()) t.stop();
    }
    streamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  }

  async function startCamera() {
    setError("");
    if (!canUseMedia) {
      setStatus("error");
      setError("Your browser does not support webcam recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setError(
        "Camera/microphone permission denied or unavailable. Please allow access and retry."
      );
    }
  }

  function resetRecording() {
    setError("");
    setSeconds(0);
    chunksRef.current = [];
    recorderRef.current = null;
    setRecordedBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    onVideoChange?.(null);
  }

  async function startRecording() {
    setError("");
    if (!streamRef.current) {
      await startCamera();
      if (!streamRef.current) return;
    }

    resetRecording();

    try {
      const rec = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : {});
      recorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      rec.onerror = () => {
        setStatus("error");
        setError("Recording failed unexpectedly.");
      };

      rec.onstop = () => {
        if (stopTimerRef.current) clearInterval(stopTimerRef.current);
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "video/webm"
        });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setStatus("stopped");
        onVideoChange?.(blob);
      };

      rec.start(250); // collect chunks every 250ms
      setStatus("recording");

      // timer
      const startedAt = Date.now();
      stopTimerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startedAt) / 1000);
        setSeconds(s);
        if (s >= maxSeconds) stopRecording();
      }, 250);
    } catch (e) {
      setStatus("error");
      setError("Could not start recording in this browser.");
    }
  }

  function stopRecording() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
  }

  const prettyTime = useMemo(() => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Record video</div>
          <div className="mt-1 text-xs text-slate-400">
            Uses your webcam + mic. Max {maxSeconds}s.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
              status === "recording"
                ? "bg-red-500/15 text-red-200"
                : "bg-white/10 text-slate-300"
            }`}
          >
            {status === "recording" ? `REC ${prettyTime}` : status.toUpperCase()}
          </span>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs text-slate-400">Live camera</div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className="aspect-video w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startCamera}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
            >
              Enable camera
            </button>
            <button
              type="button"
              onClick={startRecording}
              disabled={status === "recording"}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start recording
            </button>
            <button
              type="button"
              onClick={stopRecording}
              disabled={status !== "recording"}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-slate-400">Preview</div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
            {previewUrl ? (
              <video controls playsInline className="aspect-video w-full" src={previewUrl} />
            ) : (
              <div className="flex aspect-video items-center justify-center text-sm text-slate-500">
                No recording yet
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetRecording}
              disabled={!recordedBlob && !previewUrl}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Retake
            </button>
            <div className="text-xs text-slate-500">
              {recordedBlob ? `Captured ${(recordedBlob.size / 1024 / 1024).toFixed(2)} MB` : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        Tip: if you see a black preview, click “Enable camera” first to grant permissions.
      </div>
    </div>
  );
}

