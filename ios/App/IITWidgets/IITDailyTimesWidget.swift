//
//  IITDailyTimesWidget.swift
//  IITWidgets
//
//  Created by Antigravity.
//

import WidgetKit
import SwiftUI

struct SunTimeEntry: Codable {
    let date: String
    let dawn: String
    let noon: String
}

struct DailyTimesEntry: TimelineEntry {
    let date: Date
    let dawnTime: String
    let noonTime: String
}

struct DailyTimesProvider: TimelineProvider {
    func placeholder(in context: Context) -> DailyTimesEntry {
        DailyTimesEntry(date: Date(), dawnTime: "--:--", noonTime: "--:--")
    }

    func getSnapshot(in context: Context, completion: @escaping (DailyTimesEntry) -> Void) {
        let entry = getTodayTimesEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DailyTimesEntry>) -> Void) {
        let entry = getTodayTimesEntry()
        let currentDate = Date()
        let nextUpdateDate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate) ?? currentDate
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdateDate))
        completion(timeline)
    }

    private func getTodayTimesEntry() -> DailyTimesEntry {
        let sharedDefaults = UserDefaults(suiteName: "group.iit.calendar")
        guard let sunTimesRaw = sharedDefaults?.string(forKey: "sun_times"),
              let data = sunTimesRaw.data(using: .utf8) else {
            return DailyTimesEntry(date: Date(), dawnTime: "--:--", noonTime: "--:--")
        }

        do {
            let entries = try JSONDecoder().decode([SunTimeEntry].self, from: data)
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            formatter.locale = Locale(identifier: "en_US_POSIX")
            let todayStr = formatter.string(from: Date())

            if let todayEntry = entries.first(where: { $0.date == todayStr }) {
                return DailyTimesEntry(date: Date(), dawnTime: todayEntry.dawn, noonTime: todayEntry.noon)
            } else if let firstEntry = entries.first {
                return DailyTimesEntry(date: Date(), dawnTime: firstEntry.dawn, noonTime: firstEntry.noon)
            }
        } catch {
            print("Error decoding sun_times: \(error)")
        }

        return DailyTimesEntry(date: Date(), dawnTime: "--:--", noonTime: "--:--")
    }
}

struct IITDailyTimesWidgetView: View {
    var entry: DailyTimesProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Dawn
            VStack(alignment: .leading, spacing: 2) {
                Text("Dawn")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)
                Text(entry.dawnTime)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(.primary)
            }
            
            Divider()
            
            // Noon
            VStack(alignment: .leading, spacing: 2) {
                Text("Noon")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)
                Text(entry.noonTime)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(.primary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
    }
}

struct IITDailyTimesWidget: Widget {
    let kind: String = "IITDailyTimesWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DailyTimesProvider()) { entry in
            if #available(iOS 17.0, *) {
                IITDailyTimesWidgetView(entry: entry)
                    .containerBackground(Color(uiColor: .systemBackground), for: .widget)
            } else {
                IITDailyTimesWidgetView(entry: entry)
                    .background(Color(uiColor: .systemBackground))
            }
        }
        .configurationDisplayName("Daily Times")
        .description("Displays daily dawn and noon times.")
        .supportedFamilies([.systemSmall])
    }
}
