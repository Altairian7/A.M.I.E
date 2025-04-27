package com.dasgajraj.amie

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class DeviceAdminModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val REQUEST_CODE_ENABLE_ADMIN = 1
    
    override fun getName(): String {
        return "DeviceAdminModule"
    }
    
    @ReactMethod
    fun isDeviceAdminEnabled(promise: Promise) {
        try {
            val dpm = reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            val adminComponent = ComponentName(reactContext, MyDeviceAdminReceiver::class.java)
            
            val isAdminActive = dpm.isAdminActive(adminComponent)
            promise.resolve(isAdminActive)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun requestDeviceAdmin() {
        val adminComponent = ComponentName(reactContext, MyDeviceAdminReceiver::class.java)
        
        val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
        intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent)
        intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Enable device administrator to access advanced device controls")
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        
        reactContext.startActivity(intent)
    }
}