import React from 'react';
import { Link } from 'react-router-dom';

const BlogSidebar = () => {
    return (
        <div className="brief">
            <div className="up">
                <div className="up-down__title">
                    <span className="material-icons">category</span>
                    <span> Categories </span>
                </div>

                {/* 
            Note: These links currently point to the old PHP pages. 
            We are keeping them for SEO structure as requested. 
            They can be updated to React routes later.
        */}
                <a href="/pages/briefs.php#graphic" className="tags">Graphic</a>
                <a href="/pages/briefs.php#video" className="tags">Video</a>
                <a href="/pages/briefs.php#programing" className="tags">Programing</a>
                <a href="/pages/briefs.php#marketing" className="tags">Marketing</a>
                <a href="/pages/briefs.php#writing" className="tags">Writing</a>
                <a href="/pages/briefs.php#audio" className="tags">Audio</a>
            </div>

            <div className="down">
                <div className="up-down__title">
                    <span className="material-icons">star</span>
                    <span> Popular briefs </span>
                </div>

                <a href="/pages/graphic/illustration.php" className="chips"> Illustration</a>
                <a href="/pages/video/logo-animation.php" className="chips"> Logo animation </a>
                <a href="/pages/video/explainer-video.php" className="chips"> Explainer video</a>
                <a href="/pages/video/montage-video.php" className="chips"> Video montage</a>
                <a href="/pages/programming/system-software.php" className="chips"> System software</a>
                <a href="/pages/graphic/logo-design.php" className="chips"> Logo design </a>
                <a href="/pages/graphic/Infographic.php" className="chips"> Infographic</a>
                <a href="/pages/graphic/web-design.php" className="chips"> Web design</a>
                <a href="/pages/graphic/product-design.php" className="chips"> Product design</a>
                <a href="../email.php" className="chips"> 3d modeling </a>
                <a href="../email.php" className="chips"> 3d animation </a>
            </div>
        </div>
    );
};

export default BlogSidebar;
