import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    features: [
      'Access to basic workout plans',
      'Limited meal suggestions',
      'Community forum access',
      'Ad-supported experience'
    ],
    recommended: false,
    buttonText: 'Current Plan'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹999 / year',
    features: [
      'Access to ALL workout plans',
      'Personalized meal plans',
      'Progress tracking',
      'Ad-free experience',
      'Priority support',
      'Download workouts offline'
    ],
    recommended: true,
    buttonText: 'Upgrade Now'
  }
];

const Membership = () => {
  const { user, loading } = useAuth();
  const { testUpgrade, error } = useApi();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/login?redirect=membership';
      return;
    }
    
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      
      // For demo purposes, directly set the user as a premium member 
      const response = await testUpgrade();
      
      if (response && response.success) {
        // Refresh the page or redirect to show updated membership status
        window.location.href = '/dashboard?upgraded=true';
      } else {
        setPaymentError('Payment process failed. Please try again.');
      }
      
    } catch (err) {
      setPaymentError('Failed to process payment. Please try again.');
      console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };
  
  return (
    <div className="pt-16 px-4 max-w-7xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-[var(--color-light)] text-center my-12"
      >
        Choose Your <span className="text-[var(--color-accent)]">Plan</span>
      </motion.h1>
      
      <p className="text-center text-[var(--color-light-alt)] max-w-2xl mx-auto mb-12">
        Unlock the full potential of Diet Buddy with our Premium plan and take your fitness journey to the next level.
      </p>
      
      {paymentError && (
        <div className="bg-red-500 bg-opacity-20 text-[var(--color-light)] p-4 rounded-lg max-w-2xl mx-auto mb-8 border border-red-500 border-opacity-30">
          {paymentError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`premium-card relative overflow-hidden ${
              plan.recommended ? 'border-2 border-[var(--color-accent)]' : ''
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-[var(--color-accent)] text-[var(--color-dark)] py-1 px-4 text-sm font-bold transform rotate-0 translate-x-2 -translate-y-0 shadow-md">
                RECOMMENDED
              </div>
            )}
            
            <div className="p-8 relative">
              {plan.recommended && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl"></div>
              )}
              
              <h2 className="text-2xl font-semibold text-[var(--color-light)] mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold text-[var(--color-light)] mb-5">{plan.price}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full ${plan.recommended ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-primary)]'} flex items-center justify-center mr-3`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                    <span className="text-[var(--color-light-alt)]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={plan.id === 'premium' ? handleUpgrade : undefined}
                disabled={loading || paymentLoading || (user?.isMember && plan.id === 'premium')}
                className={`w-full py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:-translate-y-1 ${
                  plan.id === 'premium'
                    ? 'bg-[var(--color-accent)] text-[var(--color-dark)] hover:bg-[var(--color-accent-dark)]'
                    : 'bg-[var(--color-dark-alt)] text-[var(--color-light)]'
                } ${
                  (loading || paymentLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading || paymentLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2"></div>
                    <span>Processing...</span>
                  </div>
                ) : user?.isMember && plan.id === 'premium' ? (
                  'Current Plan'
                ) : (
                  plan.buttonText
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center text-[var(--color-light-alt)] mt-12 text-sm">
        <p>By upgrading to Premium, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-2">Need help? Contact our support team at <span className="text-[var(--color-accent)]">support@dietbuddy.com</span></p>
      </div>
    </div>
  );
};

export default Membership; 