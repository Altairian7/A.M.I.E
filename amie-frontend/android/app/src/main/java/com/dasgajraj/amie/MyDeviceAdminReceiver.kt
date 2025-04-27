package com.dasgajraj.amie

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast
import android.util.Log

class MyDeviceAdminReceiver : DeviceAdminReceiver() {
    private val TAG = "MyDeviceAdminReceiver"
    
    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Toast.makeText(context, "Device Admin Enabled", Toast.LENGTH_SHORT).show()
        Log.d(TAG, "Device Admin Enabled")
    }
    
    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Toast.makeText(context, "Device Admin Disabled", Toast.LENGTH_SHORT).show()
        Log.d(TAG, "Device Admin Disabled")
    }
    
    override fun onDisableRequested(context: Context, intent: Intent): CharSequence {
        return "Disabling device administrator will remove advanced security features. Are you sure?"
    }
    
    override fun onPasswordChanged(context: Context, intent: Intent) {
        super.onPasswordChanged(context, intent)
        Log.d(TAG, "Password Changed")
    }
    
    override fun onPasswordFailed(context: Context, intent: Intent) {
        super.onPasswordFailed(context, intent)
        Log.d(TAG, "Password Failed")
    }
    
    override fun onPasswordSucceeded(context: Context, intent: Intent) {
        super.onPasswordSucceeded(context, intent)
        Log.d(TAG, "Password Succeeded")
    }
}