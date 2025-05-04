package com.dasgajraj.amie

import android.app.Activity
import android.app.WallpaperManager
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper
import expo.modules.devlauncher.DevLauncherController

class MainActivity : ReactActivity() {
  private val REQUEST_HOME_SCREEN = 1
  private val REQUEST_PERMISSIONS = 2

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme)
    super.onCreate(null)
    
    // Request to be set as default home launcher
    checkDefaultLauncher()
    
    // Request permissions
    checkAndRequestPermissions()
  }

  private fun checkDefaultLauncher() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val roleManager = getSystemService(Context.ROLE_SERVICE) as RoleManager
      if (roleManager.isRoleAvailable(RoleManager.ROLE_HOME) && !roleManager.isRoleHeld(RoleManager.ROLE_HOME)) {
        val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_HOME)
        startActivityForResult(intent, REQUEST_HOME_SCREEN)
      }
    } else {
      // For older versions
      val intent = Intent(Settings.ACTION_HOME_SETTINGS)
      startActivity(intent)
    }
  }

  private fun checkAndRequestPermissions() {
    val permissionsNeeded = mutableListOf<String>()
    
    // List all permissions that need to be requested
    val permissions = arrayOf(
      android.Manifest.permission.CAMERA,
      android.Manifest.permission.RECORD_AUDIO,
      android.Manifest.permission.ACCESS_FINE_LOCATION,
      android.Manifest.permission.READ_EXTERNAL_STORAGE,
      android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
      android.Manifest.permission.READ_CONTACTS,
      android.Manifest.permission.READ_CALENDAR,
      android.Manifest.permission.READ_PHONE_STATE,
      android.Manifest.permission.READ_SMS,
      android.Manifest.permission.SEND_SMS,
      android.Manifest.permission.READ_CALL_LOG
    )
    
    // Check which permissions need to be requested
    for (permission in permissions) {
      if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
        permissionsNeeded.add(permission)
      }
    }
    
    // Request needed permissions
    if (permissionsNeeded.isNotEmpty()) {
      ActivityCompat.requestPermissions(this, permissionsNeeded.toTypedArray(), REQUEST_PERMISSIONS)
    }
  }

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    if (requestCode == REQUEST_HOME_SCREEN) {
      if (resultCode == Activity.RESULT_OK) {
        // User accepted the request to be the default launcher
      } else {
        // User declined, you may want to show a message or retry later
      }
    }
  }

  override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    if (requestCode == REQUEST_PERMISSIONS) {
      // Handle permission results if needed
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}