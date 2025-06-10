'use client';

import { useState } from 'react';
import { X, Sparkles, Shield, RefreshCw, Heart, Crown, Check, MessageCircle, Users, BarChart3, Upload, Download } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useSubscription';
import { PRICING } from '@/constants/subscription';
import Modal from '@/components/ui/Modal';

const UpgradeModal = ({ isOpen, onClose, trigger }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { daysRemaining, messagesUsedToday, totalMessagesUsed } = useTrialStatus();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Track conversion attempt
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          trigger: trigger,
          trialData: {
            daysRemaining,
            messagesUsed: totalMessagesUsed
          }
        })
      });

      const { url, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      setIsLoading(false);
      // You can add toast notification here
    }
  };

  const getModalTitle = () => {
    switch (trigger) {
      case 'message_limit':
        return 'Unlock Unlimited Conversations';
      case 'programs':
        return 'Unlock All Transformation Programs';
      case 'program_detail':
        return 'Access Premium Programs';
      case 'persona_block':
        return 'Access All 6 AI Personas';
      case 'insights_limit':
        return 'Get Complete Insights History';
      default:
        return 'Upgrade to Premium';
    }
  };

  const getModalSubtitle = () => {
    switch (trigger) {
      case 'message_limit':
        return `You've used ${messagesUsedToday}/15 messages today. Get unlimited access now!`;
      case 'persona_block':
        return 'Unlock SAGE, the most advanced AI personality for profound wisdom';
      case 'insights_limit':
        return 'Access your complete personal development journey';
      default:
        return 'Unlock the full power of AI-powered personal development';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="upgrade-modal p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{getModalTitle()}</h2>
          <p className="text-gray-600 mt-2">{getModalSubtitle()}</p>
        </div>

        {/* Features Comparison */}
        <div className="comparison-table mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Free Trial vs Premium</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="font-medium text-gray-600">Feature</div>
              <div className="text-center font-medium text-gray-600">Free Trial</div>
              <div className="text-center font-medium text-purple-600">Premium</div>
              
              <div className="py-2 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                Daily Conversations
              </div>
              <div className="text-center py-2 text-orange-600">15 messages</div>
              <div className="text-center py-2 text-purple-600 font-semibold flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" />
                Unlimited
              </div>
              
              <div className="py-2 flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                AI Personas
              </div>
              <div className="text-center py-2 text-orange-600">5 personalities</div>
              <div className="text-center py-2 text-purple-600 font-semibold flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" />
                All 6 + SAGE
              </div>
              
              <div className="py-2 flex items-center">
                <Crown className="w-4 h-4 mr-2 text-gray-500" />
                AI Companion Naming
              </div>
              <div className="text-center py-2 text-red-600">❌</div>
              <div className="text-center py-2 text-purple-600 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              
              <div className="py-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                Insights History
              </div>
              <div className="text-center py-2 text-red-600">7 days</div>
              <div className="text-center py-2 text-purple-600 font-semibold flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" />
                Unlimited
              </div>
              
              <div className="py-2 flex items-center">
                <Upload className="w-4 h-4 mr-2 text-gray-500" />
                Data Imports
              </div>
              <div className="text-center py-2 text-red-600">1 only</div>
              <div className="text-center py-2 text-purple-600 font-semibold flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" />
                Unlimited
              </div>
              
              <div className="py-2 flex items-center">
                <Download className="w-4 h-4 mr-2 text-gray-500" />
                Data Exports
              </div>
              <div className="text-center py-2 text-red-600">Basic</div>
              <div className="text-center py-2 text-purple-600 font-semibold flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" />
                Complete
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="pricing-card bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-4xl font-bold">${PRICING.monthly.amount}</span>
              <span className="text-purple-200 ml-2">/month</span>
            </div>
            <div className="text-purple-200 text-sm mb-3">
              That's only <strong>${(PRICING.monthly.amount / 30).toFixed(2)}/day</strong> for unlimited AI conversations
            </div>
            <div className="text-sm text-purple-200">
              ✅ Cancel anytime • ✅ No hidden fees • ✅ 30-day money-back guarantee
            </div>
          </div>
        </div>

        {/* Social Proof & Trust Indicators */}
        <div className="trust-indicators bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="flex flex-col items-center">
              <Shield className="w-6 h-6 text-green-600 mb-2" />
              <div className="font-medium text-gray-900">Secure Payment</div>
              <div className="text-gray-600 text-xs">256-bit SSL encryption</div>
            </div>
            <div className="flex flex-col items-center">
              <RefreshCw className="w-6 h-6 text-blue-600 mb-2" />
              <div className="font-medium text-gray-900">Cancel Anytime</div>
              <div className="text-gray-600 text-xs">No long-term commitments</div>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-6 h-6 text-red-600 mb-2" />
              <div className="font-medium text-gray-900">10K+ Users</div>
              <div className="text-gray-600 text-xs">Join the community</div>
            </div>
          </div>
        </div>

        {/* Urgency */}
        {daysRemaining > 0 && (
          <div className="urgency-bar bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-orange-800 font-medium">
                  Trial expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-orange-600 text-sm">Upgrade now to keep your data</span>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleUpgrade} 
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Crown className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Redirecting to Payment...' : 'Start Premium Now'}
          </button>
          
          <button 
            onClick={onClose}
            className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Maybe Later
          </button>
        </div>

        {/* Money back guarantee */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            💰 <strong>30-day money-back guarantee</strong> • Try Premium risk-free
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeModal;