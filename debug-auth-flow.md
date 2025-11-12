# Debug Auth Flow - Double API Call Issue

## Problem Description
User reported: "When access_token expires, frontend needs to call API twice to succeed"

## Code Analysis Results

### Current Flow (Expected)
1. ✅ **API Call 1**: Request with expired token → 401 error
2. ✅ **Token Refresh**: Automatic refresh triggered → Success  
3. ✅ **API Retry**: Same request with fresh token → Should succeed
4. ✅ **Return Result**: User should see success immediately

### Potential Issues Found

#### 1. Notification Timing
- Line 181: `notificationService.info('Token làm mới thành công', 'Đang thử lại yêu cầu...')`
- This shows "refreshing" message even when retry succeeds
- User might see "error → refreshing → success" instead of just "success"

#### 2. Console Logging Confusion
- Extensive console logs might make it seem like there are 2 separate API calls
- User might be looking at console instead of actual UX

#### 3. UI Component Error Handling
- Components might be showing error states before retry completes
- Need to check if components are properly waiting for the full promise chain

## Recommendations

### Fix 1: Remove Confusing Notifications
Remove the "Token refreshing" notification since it happens transparently:

```typescript
// REMOVE this line:
notificationService.info('Token làm mới thành công', 'Đang thử lại yêu cầu...');

// User should only see the final result (success or error)
```

### Fix 2: Add Debug Mode
Add a way to test the exact scenario:

```typescript
// Add to executeRequestWithRetry for debugging
console.log(`🧪 DEBUG: Request ${params.endpoint} - Attempt ${params.retryCount + 1}`);
```

### Fix 3: Check Component Error Handling
Verify that UI components are not showing errors from the first 401 response.

## Test Plan
1. **Manually expire token** (wait or clear cookies)
2. **Trigger an API call** (e.g., create event, load contacts)
3. **Monitor console logs** for exact flow
4. **Check user notifications** - should only see success
5. **Verify no double-click required**

## Expected Behavior
- User performs action (e.g., clicks "Save Event")
- Loading state shows
- Token refresh happens silently in background
- Success message shows
- **No indication of failure or need to retry**