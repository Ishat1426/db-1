import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadRazorpayScript, verifyRazorpay, isRazorpayAvailable } from '../utils/razorpayLoader';

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
    id: 'monthly',
    name: 'Premium Monthly',
    price: '₹99 / month',
    features: [
      'Access to ALL workout plans',
      'Personalized meal plans',
      'Progress tracking',
      'Ad-free experience',
      'Priority support'
    ],
    recommended: false,
    buttonText: 'Choose Monthly'
  },
  {
    id: 'premium',
    name: 'Premium Yearly',
    price: '₹999 / year',
    features: [
      'Access to ALL workout plans',
      'Personalized meal plans',
      'Progress tracking',
      'Ad-free experience',
      'Priority support',
      'Download workouts offline',
      '2 months free'
    ],
    recommended: true,
    buttonText: 'Upgrade Now'
  }
];

const Membership = () => {
  const { user, loading: authLoading, setUser, updateProfile } = useAuth();
  const { createOrder, createMonthlyOrder, verifyPayment, verifyMonthlyPayment, testUpgrade } = useApi();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    message: null,
    type: null // 'success', 'error', 'info'
  });
  
  // Get URL parameters for payment status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const message = params.get('message');
    
    if (status && message) {
      setPaymentStatus({
        message: decodeURIComponent(message),
        type: status
      });
      
      // Clear the URL parameters after showing the message
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Auto-dismiss the message after 5 seconds
      const timer = setTimeout(() => {
        setPaymentStatus({ message: null, type: null });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  // Add a global error handler for Razorpay
  useEffect(() => {
    // Listen for any unhandled errors from Razorpay
    const handleError = (event) => {
      // Check if the error comes from Razorpay
      if (event.message && 
          (event.message.includes('razorpay') || 
           event.message.includes('payment') || 
           event.message.includes('order'))) {
        
        console.error('Payment system error:', event);
        
        // Display a friendly error message
        setPaymentStatus({
          message: 'Payment system encountered an error. Please try again later.',
          type: 'error'
        });
        
        // Reset loading state
        setPaymentLoading(false);
      }
    };
    
    // Add error listener
    window.addEventListener('error', handleError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  useEffect(() => {
    // Check if the auth loading is complete and redirect if not logged in
    if (!authLoading && !user) {
      navigate('/login?redirect=membership');
    }
  }, [authLoading, user, navigate]);
  
  // Safe function to update user data that works with or without setUser
  const safeUpdateUser = async (userData) => {
    try {
      if (typeof setUser === 'function') {
        // If setUser is available, use it directly
        setUser(prev => ({
          ...prev,
          ...userData
        }));
      } else if (typeof updateProfile === 'function') {
        // Otherwise use updateProfile as fallback
        await updateProfile(userData);
      } else {
        console.warn('No method available to update user data');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };
  
  const handleUpgrade = async (planId) => {
    if (!user) {
      navigate('/login?redirect=membership');
      return;
    }
    
    try {
      setPaymentLoading(true);
      setPaymentStatus({ message: null, type: null });
      
      // Display initial processing message
      setPaymentStatus({
        message: "Preparing your upgrade...",
        type: 'info'
      });
      
      // Load Razorpay SDK first
      const isScriptLoaded = await loadRazorpayScript();
      
      if (!isScriptLoaded) {
        console.error('Failed to load Razorpay script');
        setPaymentStatus({
          message: "Failed to load payment gateway. Please try again later.",
          type: 'error'
        });
        setPaymentLoading(false);
        return;
      }
      
      // Verify Razorpay is properly initialized
      if (!verifyRazorpay()) {
        console.error('Razorpay verification failed');
        setPaymentStatus({
          message: "Payment gateway not properly initialized. Please try again.",
          type: 'error'
        });
        setPaymentLoading(false);
        return;
      }
      
      console.log('Razorpay SDK loaded and verified');
      
      // Create order based on plan type
      try {
        // Get the Razorpay key via our API hook instead of direct fetch
        setPaymentStatus({
          message: "Contacting payment gateway...",
          type: 'info'
        });
        
        const keyData = await getApi('payments/get-key');
        console.log('Received key data:', keyData);
        
        if (!keyData || !keyData.configured) {
          console.log('Razorpay not properly configured on server, falling back to test mode');
          // Only use test mode if in development and Razorpay is not configured
          if (process.env.NODE_ENV === 'development') {
            return handleTestUpgrade(planId);
          } else {
            throw new Error('Payment system is currently unavailable. Please try again later.');
          }
        }
        
        // Proceed with creating a real order
        setPaymentStatus({
          message: "Creating payment order...",
          type: 'info'
        });
        
        console.log(`Creating ${planId} order`);
        const orderResponse = planId === 'premium' 
          ? await createOrder()
          : await createMonthlyOrder();
          
        console.log('Order response:', orderResponse);
        
        if (!orderResponse) {
          throw new Error('Failed to create payment order - no response from server');
        }
        
        // Check for error in response
        if (orderResponse.error) {
          throw new Error(`Payment error: ${orderResponse.message || orderResponse.error}`);
        }
        
        if (!orderResponse.orderId) {
          throw new Error('Invalid order response - missing order ID');
        }
        
        console.log('Order created successfully:', orderResponse.orderId);
        
        // Track if this is a real or dummy order
        const isDummyOrder = orderResponse.isDummyOrder === true;
        
        if (isDummyOrder && process.env.NODE_ENV === 'development') {
          console.log('Received dummy order, using test upgrade flow');
          return handleDummyOrderVerification(orderResponse, planId);
        }
        
        // Initialize and configure Razorpay for a real payment
        initializeRazorpay(orderResponse, planId);
        
      } catch (orderError) {
        console.error('Order creation error:', orderError);
        let errorMessage = 'Unable to create payment order';
        
        // Extract more detailed error message if available
        if (orderError.message) {
          if (orderError.message.includes('Payment error:')) {
            errorMessage = orderError.message;
          } else {
            errorMessage += `: ${orderError.message}`;
          }
        }
        
        // Only fall back to test upgrade in development mode and for specific errors
        if (process.env.NODE_ENV === 'development' && 
            (errorMessage.includes('Unable to create payment order') || 
             errorMessage.includes('Payment gateway not properly configured') ||
             errorMessage.includes('is not valid JSON'))) {
          console.log('Falling back to test upgrade in development mode due to order creation failure');
          
          setPaymentStatus({
            message: "Razorpay unavailable. Trying test upgrade mode...",
            type: 'info'
          });
          
          // Only try test upgrade for specific error conditions
          return handleTestUpgrade(planId);
        }
        
        setPaymentStatus({
          message: errorMessage,
          type: 'error'
        });
        setPaymentLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus({
        message: err.message || 'Failed to process payment. Please try again later.',
        type: 'error'
      });
      setPaymentLoading(false);
    }
  };
  
  // Helper to make API GET requests
  const getApi = async (endpoint) => {
    try {
      const response = await fetch(`http://localhost:5007/api/${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        console.error('Non-JSON response:', await response.text());
        return null;
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  };
  
  // Separated test upgrade logic for clarity
  const handleTestUpgrade = async (planId) => {
    try {
      console.log('Running test upgrade flow for development mode');
      setPaymentStatus({
        message: "Processing test upgrade (DEV MODE ONLY)...",
        type: 'info'
      });
      
      const testUpgradeResult = await testUpgrade({ planType: planId });
      
      if (testUpgradeResult.success) {
        // Update user data
        await safeUpdateUser({
          isMember: true,
          membershipType: planId,
          membershipExpiry: testUpgradeResult.expiryDate
        });
        
        setPaymentStatus({
          message: `Test upgrade successful! You are now a ${planId} member. (DEV MODE ONLY)`,
          type: 'success'
        });
        
        // Redirect after successful upgrade
        setTimeout(() => {
          navigate('/dashboard?upgraded=true&testMode=true');
        }, 2000);
      } else {
        throw new Error('Test upgrade failed');
      }
    } catch (error) {
      console.error('Test upgrade error:', error);
      setPaymentStatus({
        message: `Test upgrade failed: ${error.message}`,
        type: 'error'
      });
      setPaymentLoading(false);
    }
  };
  
  // Handle verification for dummy orders (development only)
  const handleDummyOrderVerification = async (orderResponse, planId) => {
    try {
      console.log('Verifying dummy order in development mode');
      
      setPaymentStatus({
        message: "Processing development mode payment...",
        type: 'info'
      });
      
      // Simulate Razorpay response for a dummy order
      const dummyResponse = {
        razorpay_payment_id: `dummy_payment_${Date.now()}`,
        razorpay_order_id: orderResponse.orderId,
        razorpay_signature: 'dummy_signature',
        isDummyOrder: true
      };
      
      // Verify the dummy payment
      const verifyResponse = planId === 'premium'
        ? await verifyPayment(dummyResponse)
        : await verifyMonthlyPayment(dummyResponse);
      
      if (verifyResponse && verifyResponse.user) {
        // Update local user data using the safe method
        await safeUpdateUser(verifyResponse.user);
        
        // Show success message
        setPaymentStatus({
          message: `Development mode payment successful! You are now a ${planId === 'premium' ? 'yearly' : 'monthly'} premium member.`,
          type: 'success'
        });
        
        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard?upgraded=true&devMode=true');
        }, 2000);
      } else {
        throw new Error('Payment verification failed: Invalid response');
      }
    } catch (error) {
      console.error('Dummy order verification failed:', error);
      setPaymentStatus({
        message: `Payment verification failed: ${error.message || 'Unknown error'}.`,
        type: 'error'
      });
      setPaymentLoading(false);
    }
  };
  
  // Extract Razorpay initialization to a separate function for clarity
  const initializeRazorpay = (orderResponse, planId) => {
    // Validate required fields to prevent errors
    if (!orderResponse.orderId || !orderResponse.amount || !orderResponse.keyId) {
      console.error('Missing required fields for Razorpay initialization:', orderResponse);
      setPaymentStatus({
        message: "Invalid payment configuration. Please try again later.",
        type: 'error'
      });
      setPaymentLoading(false);
      return;
    }
    
    console.log('Initializing Razorpay with:', {
      key: orderResponse.keyId,
      amount: orderResponse.amount,
      orderId: orderResponse.orderId
    });
    
    // Configure Razorpay options
    const options = {
      key: orderResponse.keyId,
      amount: orderResponse.amount,
      currency: orderResponse.currency || 'INR',
      name: 'Diet Buddy',
      description: `${planId === 'premium' ? 'Yearly' : 'Monthly'} Premium Subscription`,
      order_id: orderResponse.orderId,
      handler: async function(response) {
        try {
          setPaymentStatus({
            message: "Verifying payment...",
            type: 'info'
          });
          
          console.log('Payment success, verifying:', response.razorpay_payment_id);
          
          // Validate payment data for security
          if (!response.razorpay_payment_id || 
              !response.razorpay_order_id || 
              !response.razorpay_signature) {
            throw new Error('Invalid payment data received');
          }
          
          // Verify the payment
          const verifyResponse = planId === 'premium'
            ? await verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                isDummyOrder: orderResponse.isDummyOrder
              })
            : await verifyMonthlyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                isDummyOrder: orderResponse.isDummyOrder
              });
          
          if (verifyResponse && verifyResponse.user) {
            // Update local user data using the safe method
            await safeUpdateUser(verifyResponse.user);
            
            // Show success message
            setPaymentStatus({
              message: `Payment successful! You are now a ${planId === 'premium' ? 'yearly' : 'monthly'} premium member.`,
              type: 'success'
            });
            
            // Auto-redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/dashboard?upgraded=true');
            }, 2000);
          } else {
            throw new Error('Payment verification failed: Invalid response');
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          setPaymentStatus({
            message: `Payment verification failed: ${error.message || 'Unknown error'}. Please contact support.`,
            type: 'error'
          });
          setPaymentLoading(false);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#7C3AED', // Match your primary color
      },
      modal: {
        ondismiss: function() {
          console.log('Razorpay payment dialog dismissed by user');
          setPaymentLoading(false);
          setPaymentStatus({
            message: 'Payment cancelled',
            type: 'info'
          });
        },
        escape: true,
        backdropclose: false
      },
      notes: {
        user_id: user?._id || user?.id || 'guest'
      }
    };
    
    // Initialize and open Razorpay
    try {
      console.log('Opening Razorpay payment dialog with key:', options.key);
      
      // Double-check that Razorpay is loaded
      if (typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay SDK not loaded properly');
      }
      
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failures
      razorpay.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        let errorMessage = 'Payment failed';
        
        if (response.error) {
          if (response.error.description) {
            errorMessage += `: ${response.error.description}`;
          } else if (response.error.reason) {
            errorMessage += `: ${response.error.reason}`;
          } else if (response.error.source || response.error.step) {
            errorMessage += ` during ${response.error.source || response.error.step}`;
          }
        }
        
        setPaymentStatus({
          message: errorMessage,
          type: 'error'
        });
        setPaymentLoading(false);
      });
      
      // Open Razorpay payment dialog
      console.log('Calling razorpay.open()');
      razorpay.open();
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      
      // Check for specific errors
      if (error.message.includes('SDK') || error.message.includes('script')) {
        // Try to reload the script
        setPaymentStatus({
          message: 'Payment gateway failed to load. Please try again.',
          type: 'error'
        });
        
        // Try reloading the script if in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('Falling back to test mode due to Razorpay script issue');
          setTimeout(() => handleTestUpgrade(planId), 1000);
          return;
        }
      } else {
        setPaymentStatus({
          message: 'Unable to initialize payment gateway. Please try again later.',
          type: 'error'
        });
      }
      
      setPaymentLoading(false);
    }
  };
  
  return (
    <div className="pt-16 px-4 max-w-7xl mx-auto bg-[var(--color-dark)] text-[var(--color-light)]">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center my-12"
      >
        Choose Your <span className="text-[var(--color-accent)]">Plan</span>
      </motion.h1>
      
      <p className="text-center text-[var(--color-light-alt)] max-w-2xl mx-auto mb-12">
        Unlock the full potential of Diet Buddy with our Premium plan and take your fitness journey to the next level.
      </p>
      
      {/* Payment Status Messages */}
      {paymentStatus.message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`max-w-2xl mx-auto mb-8 p-4 rounded-lg border ${
            paymentStatus.type === 'success' 
              ? 'bg-green-500 bg-opacity-20 border-green-500 border-opacity-30 text-green-100' 
              : paymentStatus.type === 'error'
              ? 'bg-red-500 bg-opacity-20 border-red-500 border-opacity-30 text-red-100'
              : 'bg-blue-500 bg-opacity-20 border-blue-500 border-opacity-30 text-blue-100'
          }`}
        >
          <div className="flex items-center">
            {paymentStatus.type === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {paymentStatus.type === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            {paymentStatus.type === 'info' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            <p>{paymentStatus.message}</p>
          </div>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
              
              <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-5">{plan.price}</p>
              
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
                onClick={() => plan.id !== 'basic' ? handleUpgrade(plan.id) : undefined}
                disabled={authLoading || paymentLoading || (user?.membershipType === plan.id)}
                className={`w-full py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:-translate-y-1 ${
                  plan.id === 'premium'
                    ? 'bg-[var(--color-accent)] text-[var(--color-dark)] hover:bg-[var(--color-accent-dark)]'
                    : plan.id === 'monthly'
                    ? 'bg-[var(--color-primary)] text-[var(--color-dark)] hover:bg-[var(--color-primary-dark)]'
                    : 'bg-[var(--color-dark-alt)] text-[var(--color-light)]'
                } ${
                  (authLoading || paymentLoading || user?.membershipType === plan.id) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {authLoading || paymentLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2"></div>
                    <span>Processing...</span>
                  </div>
                ) : user?.membershipType === plan.id ? (
                  'Current Plan'
                ) : plan.id === 'basic' ? (
                  'Current Plan'
                ) : (
                  plan.buttonText
                )}
              </button>
              
              {/* Test mode button - only in development */}
              {plan.id !== 'basic' && process.env.NODE_ENV !== 'production' && (
                <button
                  onClick={() => handleTestUpgrade(plan.id)}
                  disabled={authLoading || paymentLoading || (user?.membershipType === plan.id)}
                  className="w-full mt-3 py-2 rounded-lg font-semibold border border-dashed border-gray-500 text-sm bg-gray-800 text-yellow-300 hover:text-yellow-200 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Test Mode: Skip Payment (Dev Only)
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center text-[var(--color-light-alt)] mt-12 text-sm mb-8">
        <p>By upgrading to Premium, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-2">Need help? Contact our support team at <span className="text-[var(--color-accent)]">support@dietbuddy.com</span></p>
      </div>
    </div>
  );
};

export default Membership; 