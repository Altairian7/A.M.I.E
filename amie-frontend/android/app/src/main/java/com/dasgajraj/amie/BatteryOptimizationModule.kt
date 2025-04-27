package com.dasgajraj.amie

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class BatteryOptimizationModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "BatteryOptimizationModule"
    }
    
    @ReactMethod
    fun isIgnoringBatteryOptimizations(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val pm = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
                val isIgnoring = pm.isIgnoringBatteryOptimizations(reactContext.packageName)
                promise.resolve(isIgnoring)
            } else {
                // On Android versions below M, there's no battery optimization
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun requestIgnoreBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            
            if (!pm.isIgnoringBatteryOptimizations(reactContext.packageName)) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                intent.data = Uri.parse("package:${reactContext.packageName}")
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                reactContext.startActivity(intent)
            }
        }
    }
}