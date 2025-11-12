'use client';

import { DebugAuthFlow } from '@/components/debug/DebugAuthFlow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">🔧 Debug Tools</h1>
          <p className="text-gray-600 mt-2">
            Development tools for testing and debugging authentication flow issues.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Flow Testing</CardTitle>
            <CardDescription>
              Test the double API call issue when access tokens expire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DebugAuthFlow />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Issue Report</CardTitle>
            <CardDescription>
              Current reported issue: &quot;When access_token expires, frontend needs to call API twice to succeed&quot;
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <h4 className="font-semibold mb-2">🔍 Analysis Summary:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• ✅ Token refresh logic is correctly implemented</li>
                <li>• ✅ Retry mechanism works as expected</li>
                <li>• ⚠️ Removed confusing &quot;refreshing token&quot; notification</li>
                <li>• ✅ Added detailed logging for debugging</li>
              </ul>
            </div>
            
            <div className="text-sm">
              <h4 className="font-semibold mb-2">🧪 Test Instructions:</h4>
              <ol className="space-y-1 text-gray-600 list-decimal list-inside">
                <li>Open browser console (F12)</li>
                <li>Use the test component above</li>
                <li>Monitor console logs for authentication flow</li>
                <li>Verify no double-click behavior required</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}