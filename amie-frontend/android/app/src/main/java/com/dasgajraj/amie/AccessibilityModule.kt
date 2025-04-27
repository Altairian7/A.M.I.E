package com.dasgajraj.amie

import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AccessibilityModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "AccessibilityModule"
    }
    
    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        try {
            val context = reactContext.applicationContext
            val packageName = context.packageName
            val serviceClassName = MyAccessibilityService::class.java.name
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            
            val isEnabled = enabledServices != null && 
                            enabledServices.contains("$packageName/$serviceClassName")
                            
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactContext.startActivity(intent)
    }
}