package com.dasgajraj.amie

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.ArrayList

class AmiePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules = ArrayList<NativeModule>()
        modules.add(AccessibilityModule(reactContext))
        modules.add(BatteryOptimizationModule(reactContext))
        modules.add(DeviceAdminModule(reactContext))
        modules.add(LauncherModule(reactContext))
        modules.add(UsageStatsModule(reactContext))
        return modules
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}