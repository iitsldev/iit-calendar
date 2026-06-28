package com.iitcalendar.applet;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONObject;

public class StatsWidgetProvider extends AppWidgetProvider {
    private static final String TAG = "StatsWidget";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "onUpdate called for " + appWidgetIds.length + " widgets");
        try {
            SharedPreferences prefs = context.getSharedPreferences("group.iit.calendar", Context.MODE_PRIVATE);

            String medStatsRaw = prefs.getString("meditation_stats", "{}");
            if (medStatsRaw == null) medStatsRaw = "{}";
            String chantStatsRaw = prefs.getString("chant_stats", "{}");
            if (chantStatsRaw == null) chantStatsRaw = "{}";
            String studyStatsRaw = prefs.getString("study_stats", "{}");
            if (studyStatsRaw == null) studyStatsRaw = "{}";

            Log.d(TAG, "Raw med stats: " + medStatsRaw);
            Log.d(TAG, "Raw chant stats: " + chantStatsRaw);
            Log.d(TAG, "Raw study stats: " + studyStatsRaw);

            String medStreak = "0";
            try { medStreak = new JSONObject(medStatsRaw).optString("streak", "0"); } catch (Exception e) { Log.e(TAG, "medStreak error", e); }
            String medMonth = "0";
            try { medMonth = new JSONObject(medStatsRaw).optString("monthMinutes", "0"); } catch (Exception e) { Log.e(TAG, "medMonth error", e); }

            String chantStreak = "0";
            try { chantStreak = new JSONObject(chantStatsRaw).optString("streak", "0"); } catch (Exception e) { Log.e(TAG, "chantStreak error", e); }
            String chantMonth = "0";
            try { chantMonth = new JSONObject(chantStatsRaw).optString("monthSessions", "0"); } catch (Exception e) { Log.e(TAG, "chantMonth error", e); }

            String studyStreak = "0";
            try { studyStreak = new JSONObject(studyStatsRaw).optString("streak", "0"); } catch (Exception e) { Log.e(TAG, "studyStreak error", e); }
            String studyMonth = "0";
            try { studyMonth = new JSONObject(studyStatsRaw).optString("monthMinutes", "0"); } catch (Exception e) { Log.e(TAG, "studyMonth error", e); }

            for (int appWidgetId : appWidgetIds) {
                Log.d(TAG, "Updating widget id: " + appWidgetId);
                RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_stats);

                views.setTextViewText(R.id.tvMedStreak, medStreak + " days streak");
                views.setTextViewText(R.id.tvMedMonth, medMonth + " min month");

                views.setTextViewText(R.id.tvChantStreak, chantStreak + " days streak");
                views.setTextViewText(R.id.tvChantMonth, chantMonth + " sessions month");

                views.setTextViewText(R.id.tvStudyStreak, studyStreak + " days streak");
                views.setTextViewText(R.id.tvStudyMonth, studyMonth + " min month");

                appWidgetManager.updateAppWidget(appWidgetId, views);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in onUpdate", e);
        }
    }
}
