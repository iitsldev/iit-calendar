package com.iitcalendar.applet

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject

class StatsWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val prefs = context.getSharedPreferences("group.iit.calendar", Context.MODE_PRIVATE)
        
        val medStatsRaw = prefs.getString("meditation_stats", "{}") ?: "{}"
        val chantStatsRaw = prefs.getString("chant_stats", "{}") ?: "{}"
        val studyStatsRaw = prefs.getString("study_stats", "{}") ?: "{}"
        
        val medStreak = try { JSONObject(medStatsRaw).optString("streak", "0") } catch (e: Exception) { "0" }
        val medMonth = try { JSONObject(medStatsRaw).optString("monthMinutes", "0") } catch (e: Exception) { "0" }
        
        val chantStreak = try { JSONObject(chantStatsRaw).optString("streak", "0") } catch (e: Exception) { "0" }
        val chantMonth = try { JSONObject(chantStatsRaw).optString("monthSessions", "0") } catch (e: Exception) { "0" }
        
        val studyStreak = try { JSONObject(studyStatsRaw).optString("streak", "0") } catch (e: Exception) { "0" }
        val studyMonth = try { JSONObject(studyStatsRaw).optString("monthMinutes", "0") } catch (e: Exception) { "0" }

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_stats)
            
            views.setTextViewText(R.id.tvMedStreak, "$medStreak days streak")
            views.setTextViewText(R.id.tvMedMonth, "$medMonth min month")
            
            views.setTextViewText(R.id.tvChantStreak, "$chantStreak days streak")
            views.setTextViewText(R.id.tvChantMonth, "$chantMonth sessions month")
            
            views.setTextViewText(R.id.tvStudyStreak, "$studyStreak days streak")
            views.setTextViewText(R.id.tvStudyMonth, "$studyMonth min month")
            
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
