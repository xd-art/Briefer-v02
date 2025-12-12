import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ article }) => {
    return (
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <Link to={`/blog/${article.slug}`} className="block overflow-hidden group">
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
            </Link>
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="font-medium">{article.author}</span>
                    <span className="mx-2">•</span>
                    <span>{article.date}</span>
                </div>
                <Link to={`/blog/${article.slug}`} className="block mb-3">
                    <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                    </h2>
                </Link>
                <p className="text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-3">
                    {article.excerpt}
                </p>
                <Link
                    to={`/blog/${article.slug}`}
                    className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 mt-auto"
                >
                    Read more
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default BlogCard;
