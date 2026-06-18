package com.iitcalendar.applet

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.*

class DailyTimesWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val prefs = context.getSharedPreferences("group.iit.calendar", Context.MODE_PRIVATE)
        val sunTimesRaw = prefs.getString("sun_times", "[]") ?: "[]"
        
        var dawnText = "--:--"
        var noonText = "--:--"
        
        try {
            val sunArray = JSONArray(sunTimesRaw)
            if (sunArray.length() > 0) {
                // Find today's entry
                val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                var found = false
                for (i in 0 until sunArray.length()) {
                    val entry = sunArray.getJSONObject(i)
                    if (entry.optString("date") == todayStr) {
                        dawnText = entry.optString("dawn", "--:--")
                        noonText = entry.optString("noon", "--:--")
                        found = true
                        break
                    }
                }
                // Fallback to first entry if today not found
                if (!found) {
                    val first = sunArray.getJSONObject(0)
                    dawnText = first.optString("dawn", "--:--")
                    noonText = first.optString("noon", "--:--")
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_daily_times)
            views.setTextViewText(R.id.tvDawnTime, dawnText)
            views.setTextViewText(R.id.tvNoonTime, noonText)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
