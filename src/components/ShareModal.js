import React from 'react';
import { FaTimes, FaFacebook, FaTwitter, FaLinkedin, FaLink, FaWhatsapp } from 'react-icons/fa';
import { EmailShareButton, FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from "react-share";
import "../styles/ShareModal.css"; // Import the CSS file for styling

const ShareModal = ({ event, onClose }) => {
    if (!event) return null;

    const shareUrl = window.location.href;
    const title = `Check out this event: ${event.eventName}`;
    const description = `${event.eventDesc.substring(0, 100)}...`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="event-share-modal-overlay">
            <div className="event-share-modal">
                <div className="event-share-modal-header">
                    <h3>Share this event</h3>
                    <button className="event-share-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="event-share-modal-body">
                    <div className="event-share-options">
                        <FacebookShareButton
                            url={shareUrl}
                            quote={title}
                            className="event-share-button"
                        >
                            <div className="event-share-option">
                                <FaFacebook className="event-share-icon event-share-facebook" />
                                <span>Facebook</span>
                            </div>
                        </FacebookShareButton>

                        <TwitterShareButton
                            url={shareUrl}
                            title={title}
                            className="event-share-button"
                        >
                            <div className="event-share-option">
                                <FaTwitter className="event-share-icon event-share-twitter" />
                                <span>Twitter</span>
                            </div>
                        </TwitterShareButton>

                        <LinkedinShareButton
                            url={shareUrl}
                            title={title}
                            summary={description}
                            className="event-share-button"
                        >
                            <div className="event-share-option">
                                <FaLinkedin className="event-share-icon event-share-linkedin" />
                                <span>LinkedIn</span>
                            </div>
                        </LinkedinShareButton>

                        <WhatsappShareButton
                            url={shareUrl}
                            title={title}
                            className="event-share-button"
                        >
                            <div className="event-share-option">
                                <FaWhatsapp className="event-share-icon event-share-whatsapp" />
                                <span>WhatsApp</span>
                            </div>
                        </WhatsappShareButton>

                        <div className="event-share-option" onClick={copyToClipboard}>
                            <FaLink className="event-share-icon event-share-link" />
                            <span>Copy Link</span>
                        </div>
                    </div>
                </div>
                <div className="event-share-modal-footer">
                    <button className="event-share-cancel-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;