package com.dasgajraj.amie

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.util.Log

class MyAccessibilityService : AccessibilityService() {
    private val TAG = "MyAccessibilityService"
    
    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Handle accessibility events here
        // This method is called when an AccessibilityEvent is fired
        Log.d(TAG, "onAccessibilityEvent: $event")
    }
    
    override fun onInterrupt() {
        // This method is called when the system wants to interrupt the feedback
        Log.d(TAG, "onInterrupt")
    }
    
    override fun onServiceConnected() {
        super.onServiceConnected()
        // Configure the service when it's connected
        Log.d(TAG, "onServiceConnected")
        
        var info = serviceInfo ?: AccessibilityServiceInfo()
        
        // Set the type of events that this service wants to listen to
        info.eventTypes = AccessibilityEvent.TYPES_ALL_MASK
        
        // Set the type of feedback your service will provide
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_ALL_MASK
        
        // Set additional flags
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                     AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
                     AccessibilityServiceInfo.FLAG_REQUEST_ENHANCED_WEB_ACCESSIBILITY or
                     AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
        
        // Set the timeout between accessibility events
        info.notificationTimeout = 100
        
        serviceInfo = info
    }
}