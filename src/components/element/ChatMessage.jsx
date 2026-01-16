import React, { useEffect, useRef } from "react";
import { attachEmbedHandlers } from "../../function/htmlHelper";

export default function ChatMessage({ role = "assistant", content, time = "14:03" }) {
  const isUser = role === "user";
  const isRich =
    typeof content === "string" && content.includes('data-rich="1"');
  const rootRef = useRef(null);
  useEffect(() => {
    if (!rootRef.current) return;
    // Active les iframes “au clic” uniquement pour CE message
    attachEmbedHandlers(rootRef.current);
  }, [content]); // à chaque changement de HTML

  return (
    <div className={`msg ${isUser ? "user" : "assistant"}`}>
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-assistant"}`}>
        {isRich ? (
          // Le HTML est généré par TON backend pour l’assistant (galerie + reply)
          <div ref={rootRef}
            className="content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="content">{content}</div>
        )}

        <div className="meta">
          {isUser ? "Vous" : "Assistant"} · {time}
        </div>
      </div>
      {isUser && (
        <div className="avatar" aria-hidden>
          <span><i className="fa fa-user iconActive"></i> </span>
        </div>
      )}
    </div>
  );
}
