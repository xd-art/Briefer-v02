import React from 'react';
import PropTypes from 'prop-types';

/**
 * ThreeColumnLayout
 * 
 * A responsive 3-column layout component that adapts to screen size:
 * - Desktop (≥ lg): Shows all 3 columns (3-6-3 grid distribution)
 * - Mobile/Tablet (< lg): Stacks into single column
 * 
 * @param {ReactNode} left - Content for left sidebar (optional)
 * @param {ReactNode} children - Main content for center column (required)
 * @param {ReactNode} right - Content for right sidebar (optional)
 * @param {boolean} showLeftOnMobile - Show left column on mobile (default: false)
 * @param {boolean} showRightOnMobile - Show right column on mobile (default: false)
 * @param {string} containerClassName - Additional classes for outer container
 * @param {string} leftClassName - Additional classes for left column
 * @param {string} centerClassName - Additional classes for center column
 * @param {string} rightClassName - Additional classes for right column
 */
const ThreeColumnLayout = ({
    left,
    children,
    right,
    showLeftOnMobile = false,
    showRightOnMobile = false,
    containerClassName = '',
    leftClassName = '',
    centerClassName = '',
    rightClassName = ''
}) => {
    // Determine visibility classes for left column
    const leftVisibilityClass = showLeftOnMobile 
        ? 'lg:col-span-2' 
        : 'hidden lg:block lg:col-span-2';

    // Determine visibility classes for right column
    const rightVisibilityClass = showRightOnMobile 
        ? 'lg:col-span-2' 
        : 'hidden lg:block lg:col-span-2';

    return (
        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 ${containerClassName}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Column - Navigation / Categories */}
                {left && (
                    <aside 
                        className={`${leftVisibilityClass} ${leftClassName} animate-fadeIn`}
                        aria-label="Left sidebar navigation"
                    >
                        {left}
                    </aside>
                )}

                {/* Center Column - Main Content */}
                <div 
                    className={`col-span-1 ${left && right ? 'lg:col-span-8' : left || right ? 'lg:col-span-10' : 'lg:col-span-12'} ${centerClassName} animate-fadeIn`}
                    role="main"
                    style={{ animationDelay: '0.1s' }}
                >
                    {children}
                </div>

                {/* Right Column - Sidebar / Featured Content */}
                {right && (
                    <aside 
                        className={`${rightVisibilityClass} ${rightClassName} animate-fadeIn`}
                        aria-label="Right sidebar"
                        style={{ animationDelay: '0.2s' }}
                    >
                        {right}
                    </aside>
                )}
            </div>
        </main>
    );
};

ThreeColumnLayout.propTypes = {
    left: PropTypes.node,
    children: PropTypes.node.isRequired,
    right: PropTypes.node,
    showLeftOnMobile: PropTypes.bool,
    showRightOnMobile: PropTypes.bool,
    containerClassName: PropTypes.string,
    leftClassName: PropTypes.string,
    centerClassName: PropTypes.string,
    rightClassName: PropTypes.string
};

export default ThreeColumnLayout;
