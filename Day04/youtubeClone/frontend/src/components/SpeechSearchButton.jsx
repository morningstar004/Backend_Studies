import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CornerDownLeft, Mic, Square } from "lucide-react";
import { toast } from "sonner";

export default function SpeechSearchButton({ onSearch }) {
  const [phase, setPhase] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const requestIdRef = useRef(0);
  const isListening = phase === "listening";

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      recognitionRef.current?.abort();
    },
    [],
  );

  const stopListening = () => {
    requestIdRef.current += 1;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setPhase("idle");
    setTranscript("");
  };

  const startListening = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech search is not supported by this browser.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Microphone access is not available in this browser.");
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setTranscript("");
    setPhase("listening");

    let microphoneStream;
    try {
      microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      microphoneStream.getTracks().forEach((track) => track.stop());
      if (requestId !== requestIdRef.current) return;

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = navigator.language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const result = event.results[0]?.[0]?.transcript?.trim();
        if (result) setTranscript(result);
      };
      recognition.onerror = (event) => {
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          toast.error("Allow microphone access to use speech search.");
          setPhase("idle");
        } else if (event.error !== "aborted") {
          toast.error("Unable to recognize speech. Please try again.");
          setPhase("complete");
        }
      };
      recognition.onend = () => {
        if (requestId !== requestIdRef.current) return;
        recognitionRef.current = null;
        setPhase((currentPhase) =>
          currentPhase === "listening" ? "complete" : currentPhase,
        );
      };
      recognition.start();
    } catch (error) {
      microphoneStream?.getTracks().forEach((track) => track.stop());
      if (requestId !== requestIdRef.current) return;
      setPhase("idle");
      if (error.name === "NotAllowedError" || error.name === "SecurityError") {
        toast.error("Allow microphone access to use speech search.");
      } else {
        toast.error("Unable to start speech search. Please try again.");
      }
    }
  };

  const submitTranscript = () => {
    if (!transcript.trim()) return;
    setPhase("idle");
    onSearch(transcript.trim());
  };

  return (
    <>
      <button
        type="button"
        aria-label="Speech to search"
        title="Search by voice"
        onClick={startListening}
        className="icon-button absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-black/55 dark:text-white/55"
      >
        <Mic size={18} />
      </button>

      {phase !== "idle" &&
        createPortal(
          <div
            className="pointer-events-auto fixed inset-0 z-[100] flex items-start justify-center bg-black/45 px-4 pt-[12vh] backdrop-blur-[1.5px] backdrop-brightness-90 backdrop-saturate-50"
            onClick={(event) => {
              if (event.target === event.currentTarget) stopListening();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && phase === "complete") {
                event.preventDefault();
                submitTranscript();
              }
              if (event.key === "Escape") stopListening();
            }}
          >
            <section
              aria-label="Voice search"
              aria-modal="true"
              aria-live="polite"
              className="relative flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-black/10 bg-white px-6 py-8 text-center shadow-2xl dark:border-white/10 dark:bg-[#111111]"
            >
              <button
                type="button"
                onClick={isListening ? stopListening : submitTranscript}
                disabled={!isListening && !transcript.trim()}
                aria-label={
                  isListening ? "Stop listening" : "Search recognized words"
                }
                className="absolute right-3 top-3 inline-flex h-10 items-center gap-2 rounded-full border border-black/10 px-3 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/10"
              >
                {isListening ? (
                  <>
                    <Square size={14} fill="currentColor" />
                    Stop
                  </>
                ) : (
                  <>
                    Enter
                    <CornerDownLeft size={15} />
                  </>
                )}
              </button>

              <div className="relative mt-4 grid h-28 w-28 place-items-center">
                {isListening && (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    <span className="absolute inset-2 animate-pulse rounded-full bg-primary/15" />
                  </>
                )}
                <span className="relative grid h-20 w-20 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                  <Mic
                    size={36}
                    className={isListening ? "animate-pulse" : ""}
                  />
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">
                  {isListening ? "Listening..." : "Listening complete"}
                </h2>
                <p className="min-h-6 text-sm text-black/60 dark:text-white/60">
                  {transcript ||
                    (isListening
                      ? "Speak now to search videos or creators."
                      : "No speech detected. Click the microphone to try again.")}
                </p>
                {phase === "complete" && !transcript && (
                  <button
                    type="button"
                    onClick={startListening}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
