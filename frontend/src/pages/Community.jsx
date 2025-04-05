import { motion } from 'framer-motion';
import { useState } from 'react';

const forumPosts = [
  {
    id: 1,
    title: 'How to stay motivated during a weight loss journey?',
    author: 'FitnessLover',
    date: '2 days ago',
    content: 'I\'ve been trying to lose weight for the past month but I\'m starting to lose motivation. Any tips on how to stay committed?',
    likes: 24,
    comments: 8
  },
  {
    id: 2,
    title: 'Best protein sources for vegetarians?',
    author: 'PlantPower',
    date: '1 week ago',
    content: 'I\'m a vegetarian looking to increase my protein intake. What are some good plant-based protein sources that you recommend?',
    likes: 32,
    comments: 15
  },
  {
    id: 3,
    title: 'HIIT vs Steady State Cardio - which is better?',
    author: 'CardioKing',
    date: '3 days ago',
    content: 'I\'m trying to improve my cardiovascular health and burn fat. Should I focus on HIIT workouts or longer steady-state cardio sessions?',
    likes: 18,
    comments: 12
  },
  {
    id: 4,
    title: 'How to overcome workout plateaus?',
    author: 'GymRat2000',
    date: '5 days ago',
    content: 'I\'ve been doing the same workout routine for 3 months and I\'m not seeing progress anymore. How do I break through this plateau?',
    likes: 15,
    comments: 7
  }
];

const Community = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  
  return (
    <div className="pt-16 px-4 max-w-7xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-[var(--color-light)] text-center my-12"
      >
        <span className="text-[var(--color-secondary)]">Community</span> Forum
      </motion.h1>
      
      <p className="text-center text-[var(--color-light-alt)] max-w-2xl mx-auto mb-12">
        Connect with fellow fitness enthusiasts, share your journey, and get motivated by others' success stories.
      </p>
      
      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-md shadow-lg" role="group">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-6 py-3 text-sm font-medium rounded-l-lg transition-all ${
              activeTab === 'discussions'
                ? 'bg-[var(--color-secondary)] text-[var(--color-light)] shadow-md'
                : 'bg-[var(--color-dark-alt)] text-[var(--color-light-alt)] hover:bg-[var(--color-dark-alt)] hover:text-[var(--color-light)]'
            }`}
          >
            Discussions
          </button>
          <button
            onClick={() => setActiveTab('success')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'success'
                ? 'bg-[var(--color-secondary)] text-[var(--color-light)] shadow-md'
                : 'bg-[var(--color-dark-alt)] text-[var(--color-light-alt)] hover:bg-[var(--color-dark-alt)] hover:text-[var(--color-light)]'
            }`}
          >
            Success Stories
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-3 text-sm font-medium rounded-r-lg transition-all ${
              activeTab === 'challenges'
                ? 'bg-[var(--color-secondary)] text-[var(--color-light)] shadow-md'
                : 'bg-[var(--color-dark-alt)] text-[var(--color-light-alt)] hover:bg-[var(--color-dark-alt)] hover:text-[var(--color-light)]'
            }`}
          >
            Challenges
          </button>
        </div>
      </div>
      
      {/* Create Post Button */}
      <div className="flex justify-end mb-8">
        <button className="bg-[var(--color-secondary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary-dark)] transition-all flex items-center shadow-lg transform hover:-translate-y-1">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create Post
        </button>
      </div>
      
      {/* Forum Posts */}
      <div className="space-y-6">
        {forumPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="premium-card hover:border-[var(--color-secondary)] hover:border-opacity-50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-xl font-semibold text-[var(--color-light)]">{post.title}</h2>
              <span className="text-[var(--color-light-alt)] text-sm">{post.date}</span>
            </div>
            <p className="text-[var(--color-light-alt)] mb-5">{post.content}</p>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-5">
                <span className="flex items-center text-[var(--color-secondary-dark)]">
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  {post.likes} Likes
                </span>
                <span className="flex items-center text-[var(--color-secondary-dark)]">
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  {post.comments} Comments
                </span>
              </div>
              <div>
                <span className="bg-[var(--color-dark-alt)] px-3 py-1 rounded-full text-xs text-[var(--color-secondary)]">By {post.author}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Load More Button */}
      <div className="flex justify-center mt-12">
        <button className="border border-[var(--color-secondary)] border-opacity-50 text-[var(--color-secondary)] px-6 py-2 rounded-full text-sm font-medium hover:bg-[var(--color-secondary)] hover:bg-opacity-10 transition-all">
          Load More
        </button>
      </div>
    </div>
  );
};

export default Community; 