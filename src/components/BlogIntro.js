import React from 'react';
import { Link } from 'react-router-dom';

const BlogIntro = () => {
    return (
        <div className="intro">
            <div className="intro__content">
                <div className="intro__txt">
                    <article>
                        <h2>Dear Writer</h2>
                        <hr className="brief--hr" />
                        <p>
                            Our site compiles articles on various work-related topics, and welcomes professionals to submit their own articles with contact details included.
                            <br />
                            Share your valuable experiences with the world by sending us an email, and receive promotion as the author of your article on our site. Don't forget to leave your details!
                        </p>
                    </article>

                    <button onClick={() => window.location.href = '/pages/email.php'} className="blue-button">
                        <span className="material-icons">mail</span>
                        Send article
                    </button>
                </div>

                {/* Video removed as requested */}
                <div className="intro__video_placeholder" style={{ flex: 1 }}>
                    {/* Placeholder or empty div to maintain layout if needed */}
                </div>
            </div>
        </div>
    );
};

export default BlogIntro;
