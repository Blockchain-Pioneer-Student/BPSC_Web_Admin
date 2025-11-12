import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { eventService } from '@/lib/services/eventService';
import { toast } from 'sonner';

/**
 * 🧪 DEBUG COMPONENT - Test Auth Flow Double Call Issue
 * 
 * This component helps test and debug the authentication flow
 * to verify that API calls succeed on first attempt after token refresh.
 */
export function DebugAuthFlow() {
  const [isLoading, setIsLoading] = useState(false);
  const [callCount, setCallCount] = useState(0);

  const testApiCall = async () => {
    setIsLoading(true);
    const currentCall = callCount + 1;
    setCallCount(currentCall);

    console.log(`🧪 DEBUG TEST ${currentCall}: Starting API call...`);

    try {
      // Make a simple API call that requires auth
      const events = await eventService.getAllEvents();
      
      console.log(`🧪 DEBUG TEST ${currentCall}: SUCCESS - Got ${events.length} events`);
      toast.success(`✅ Test ${currentCall}: API call succeeded! Got ${events.length} events`);
      
    } catch (error: any) {
      console.error(`🧪 DEBUG TEST ${currentCall}: FAILED -`, error);
      toast.error(`❌ Test ${currentCall}: API call failed - ${error.message}`);
      
    } finally {
      setIsLoading(false);
    }
  };

  const clearTokenTest = async () => {
    try {
      // Call an endpoint that doesn't exist to force 401 or clear cookies
      await fetch('/api/auth/debug-clear', { 
        method: 'POST', 
        credentials: 'include' 
      });
      toast.info('🧹 Attempted to clear tokens for testing');
    } catch (error) {
      console.log('Expected error when clearing tokens:', error);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
        🧪 Debug Auth Flow - Double Call Issue
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-yellow-700 mb-2">
            <strong>Test Steps:</strong>
          </p>
          <ol className="text-xs text-yellow-600 space-y-1 ml-4">
            <li>1. Open browser console to see detailed logs</li>
            <li>2. Wait for token to expire OR click &quot;Clear Tokens&quot;</li>
            <li>3. Click &quot;Test API Call&quot; - should succeed in one try</li>
            <li>4. Check console logs for retry behavior</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={testApiCall}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? '⏳ Testing...' : `🧪 Test API Call (${callCount})`}
          </Button>

          <Button
            onClick={clearTokenTest}
            variant="destructive"
            size="sm"
          >
            🧹 Clear Tokens
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <strong>Expected Result:</strong> API call should succeed on first attempt, 
          even if token needs refresh. No &quot;double call&quot; behavior.
        </div>
      </div>
    </div>
  );
}