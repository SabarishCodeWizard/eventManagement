import React from 'react';
import { FaTimes, FaFacebook, FaTwitter, FaLinkedin, FaLink, FaWhatsapp } from 'react-icons/fa';
import { EmailShareButton, FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from "react-share";
import "../styles/ShareModal.css";

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
        <div className="modal-overlay">
            <div className="share-modal">
                <div className="modal-header">
                    <h3>Share this event</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="share-options">
                        <FacebookShareButton
                            url={shareUrl}
                            quote={title}
                            className="share-button"
                        >
                            <div className="share-option">
                                <FaFacebook className="share-icon facebook" />
                                <span>Facebook</span>
                            </div>
                        </FacebookShareButton>

                        <TwitterShareButton
                            url={shareUrl}
                            title={title}
                            className="share-button"
                        >
                            <div className="share-option">
                                <FaTwitter className="share-icon twitter" />
                                <span>Twitter</span>
                            </div>
                        </TwitterShareButton>

                        <LinkedinShareButton
                            url={shareUrl}
                            title={title}
                            summary={description}
                            className="share-button"
                        >
                            <div className="share-option">
                                <FaLinkedin className="share-icon linkedin" />
                                <span>LinkedIn</span>
                            </div>
                        </LinkedinShareButton>

                        <WhatsappShareButton
                            url={shareUrl}
                            title={title}
                            className="share-button"
                        >
                            <div className="share-option">
                                <FaWhatsapp className="share-icon whatsapp" />
                                <span>WhatsApp</span>
                            </div>
                        </WhatsappShareButton>

                        <div className="share-option" onClick={copyToClipboard}>
                            <FaLink className="share-icon link" />
                            <span>Copy Link</span>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;