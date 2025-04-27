package com.dasgajraj.amie

import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class LauncherModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LauncherModule"
    }

    @ReactMethod
    fun isDefaultLauncher(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val intent = Intent(Intent.ACTION_MAIN)
            intent.addCategory(Intent.CATEGORY_HOME)
            
            val resolveInfo = pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
            val isDefault = resolveInfo?.activityInfo?.packageName == reactContext.packageName
            
            promise.resolve(isDefault)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun openDefaultLauncherSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            // For Android 7.0+ (Nougat)
            val intent = Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
        } else {
            // For older Android versions
            val intent = Intent(Intent.ACTION_MAIN)
            intent.addCategory(Intent.CATEGORY_HOME)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
        }
    }
    
    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val packageManager: PackageManager = reactContext.packageManager
            val launchIntent: Intent? = packageManager.getLaunchIntentForPackage(packageName)

            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(launchIntent)
                promise.resolve("App launched successfully")
            } else {
                promise.reject("LAUNCH_ERROR", "App not found: $packageName")
            }
        } catch (e: Exception) {
            promise.reject("LAUNCH_EXCEPTION", e.message)
        }
    }
}