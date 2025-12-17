import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/briefer-logo.svg';

const Footer = () => {
    return (
        <footer className="bg-white text-black shadow-[0_-4px_24px_rgba(0,0,0,0.1)] pt-12 pb-8 mt-auto z-50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Logo Section */}
                <div className="flex justify-start mb-12">
                    <Link to="/">
                        <img src={Logo} alt="Briefer Logo" className="h-4 brightness-0" />
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0 text-center md:text-left">

                    {/* Section 1: Contacts & Social */}
                    <div className="flex flex-col items-center md:items-start space-y-6">
                        <a href="mailto:hello@briefer.pro" className="text-md font-medium hover:text-gray-600 transition-colors">
                            hello@briefer.pro
                        </a>

                        <div className="flex space-x-6">
                            {/* Facebook */}
                            <a href="https://www.facebook.com/profile.php?id=100092340455239" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a href="https://www.instagram.com/work.memes.briefer/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468.99c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.821-.049.975-.045 1.504-.207 1.857-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.049-3.821-.045-.975-.207-1.504-.344-1.857a3.257 3.257 0 00-.748-1.15 3.259 3.259 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>

                            {/* Medium */}
                            <a href="https://medium.com/@danilkhorzhevskyi" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Section 2: Links & Copyright */}
                    <div className="flex flex-col items-center md:items-end space-y-6">
                        <div className="flex space-x-6 text-sm font-medium">
                            <Link to="/terms-and-conditions" className="hover:text-gray-600 transition-colors">Terms of Use</Link>
                            <Link to="/privacy-policy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
                        </div>
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} Briefer. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
