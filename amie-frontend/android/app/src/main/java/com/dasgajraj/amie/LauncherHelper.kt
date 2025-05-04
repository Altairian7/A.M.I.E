package com.dasgajraj.amie

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LauncherHelper(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val REQUEST_HOME_SCREEN = 1

    override fun getName() = "LauncherHelper"

    @ReactMethod
    fun setAsDefaultLauncher(promise: Promise) {
        val currentActivity = reactContext.currentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "No activity available")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            requestDefaultLauncherRoleForQ(currentActivity, promise)
        } else {
            openHomeSettings(promise)
        }
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun requestDefaultLauncherRoleForQ(activity: Activity, promise: Promise) {
        val roleManager = activity.getSystemService(Context.ROLE_SERVICE) as RoleManager
        if (roleManager.isRoleAvailable(RoleManager.ROLE_HOME)) {
            if (roleManager.isRoleHeld(RoleManager.ROLE_HOME)) {
                promise.resolve(true)
            } else {
                try {
                    val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_HOME)
                    activity.startActivityForResult(intent, REQUEST_HOME_SCREEN)
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject("ERROR", e.message)
                }
            }
        } else {
            promise.reject("ROLE_NOT_AVAILABLE", "Home role is not available on this device")
        }
    }

    private fun openHomeSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_HOME_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun isDefaultLauncher(promise: Promise) {
        val packageManager = reactContext.packageManager
        val intent = Intent(Intent.ACTION_MAIN)
        intent.addCategory(Intent.CATEGORY_HOME)
        val resolveInfo = packageManager.resolveActivity(intent, 0)
        val isDefault = resolveInfo?.activityInfo?.packageName == reactContext.packageName
        promise.resolve(isDefault)
    }
}