import React from 'react';
import { FaTimes, FaFacebook, FaTwitter, FaLinkedin, FaLink, FaWhatsapp } from 'react-icons/fa';
import { EmailShareButton, FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from "react-share";

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
        <div className="share-modal-overlay">
            <div className="share-modal-content">
                <div className="share-modal-header">
                    <h3>Share this event</h3>
                    <button className="share-modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="share-modal-body">
                    <div className="share-modal-options">
                        <FacebookShareButton
                            url={shareUrl}
                            quote={title}
                            className="share-modal-button"
                        >
                            <div className="share-modal-option">
                                <FaFacebook className="share-modal-icon facebook" />
                                <span>Facebook</span>
                            </div>
                        </FacebookShareButton>

                        <TwitterShareButton
                            url={shareUrl}
                            title={title}
                            className="share-modal-button"
                        >
                            <div className="share-modal-option">
                                <FaTwitter className="share-modal-icon twitter" />
                                <span>Twitter</span>
                            </div>
                        </TwitterShareButton>

                        <LinkedinShareButton
                            url={shareUrl}
                            title={title}
                            summary={description}
                            className="share-modal-button"
                        >
                            <div className="share-modal-option">
                                <FaLinkedin className="share-modal-icon linkedin" />
                                <span>LinkedIn</span>
                            </div>
                        </LinkedinShareButton>

                        <WhatsappShareButton
                            url={shareUrl}
                            title={title}
                            className="share-modal-button"
                        >
                            <div className="share-modal-option">
                                <FaWhatsapp className="share-modal-icon whatsapp" />
                                <span>WhatsApp</span>
                            </div>
                        </WhatsappShareButton>

                        <div className="share-modal-option" onClick={copyToClipboard}>
                            <FaLink className="share-modal-icon link" />
                            <span>Copy Link</span>
                        </div>
                    </div>
                </div>
                <div className="share-modal-footer">
                    <button className="share-modal-cancel-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;