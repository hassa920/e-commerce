// components/WhatsAppButton/WhatsAppButton.jsx
import React, { useState } from "react";
import "./WhatsAppButton.css";

const WHATSAPP_NUMBER = "923001234567"; // ✅ Change to your number (with country code, no +)
const DEFAULT_MESSAGE = "Hi! I need help with my order 👋";

const QUICK_MESSAGES = [
    { label: "🛍️ Track my order", text: "Hi! I want to track my order status." },
    { label: "💳 Payment issue", text: "Hi! I'm facing an issue with my payment." },
    { label: "🔄 Return / Refund", text: "Hi! I want to request a return or refund." },
    { label: "❓ General query", text: "Hi! I have a general query." },
];

const WhatsAppButton = () => {
    const [open, setOpen] = useState(false);
    const [customMessage, setCustomMessage] = useState("");

    const openWhatsApp = (message) => {
        const text = encodeURIComponent(message || DEFAULT_MESSAGE);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    };

    const handleCustomSend = () => {
        if (!customMessage.trim()) return;
        openWhatsApp(customMessage.trim());
        setCustomMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleCustomSend();
    };

    return (
        <div className="wa-wrapper">

            {/* ── Popup ── */}
            {open && (
                <div className="wa-popup">

                    {/* Header */}
                    <div className="wa-popup-header">
                        <div className="wa-avatar">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                alt="WhatsApp"
                            />
                        </div>
                        <div className="wa-header-text">
                            <p className="wa-header-name">Support Team</p>
                            <p className="wa-header-status">
                                <span className="wa-online-dot" /> Online
                            </p>
                        </div>
                        <button
                            className="wa-close-btn"
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Chat bubble */}
                    <div className="wa-chat-area">
                        <div className="wa-bubble">
                            👋 Hi there! How can we help you today?
                            <br /><br />
                            Choose a topic below or type your message.
                        </div>
                    </div>

                    {/* Quick messages */}
                    <div className="wa-quick-messages">
                        {QUICK_MESSAGES.map((msg, i) => (
                            <button
                                key={i}
                                className="wa-quick-btn"
                                onClick={() => openWhatsApp(msg.text)}
                            >
                                {msg.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom message input */}
                    <div className="wa-input-row">
                        <input
                            type="text"
                            className="wa-input"
                            placeholder="Type a message..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="wa-send-btn"
                            onClick={handleCustomSend}
                        >
                            ➤
                        </button>
                    </div>

                </div>
            )}

            {/* ── Floating Button ── */}
            <button
                className={`wa-fab ${open ? "active" : ""}`}
                onClick={() => setOpen(!open)}
                aria-label="Chat on WhatsApp"
            >
                {open ? (
                    <span className="wa-fab-close">✕</span>
                ) : (
                    <>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            alt="WhatsApp"
                            className="wa-fab-icon"
                        />
                        <span className="wa-fab-ping" />
                    </>
                )}
            </button>

        </div>
    );
};

export default WhatsAppButton;