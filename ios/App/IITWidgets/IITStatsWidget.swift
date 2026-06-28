//
//  IITStatsWidget.swift
//  IITWidgets
//
//  Created by Antigravity.
//

import WidgetKit
import SwiftUI

struct MeditationStats: Codable {
    let streak: Int?
    let monthMinutes: Int?
}

struct ChantStats: Codable {
    let streak: Int?
    let monthSessions: Int?
}

struct StudyStats: Codable {
    let streak: Int?
    let monthMinutes: Int?
}

struct StatsEntry: TimelineEntry {
    let date: Date
    let meditationStreak: Int
    let meditationMonth: Int
    let chantStreak: Int
    let chantMonth: Int
    let studyStreak: Int
    let studyMonth: Int
}

struct StatsProvider: TimelineProvider {
    func placeholder(in context: Context) -> StatsEntry {
        StatsEntry(
            date: Date(),
            meditationStreak: 0,
            meditationMonth: 0,
            chantStreak: 0,
            chantMonth: 0,
            studyStreak: 0,
            studyMonth: 0
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (StatsEntry) -> Void) {
        let entry = getStatsEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StatsEntry>) -> Void) {
        let entry = getStatsEntry()
        let currentDate = Date()
        let nextUpdateDate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate) ?? currentDate
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdateDate))
        completion(timeline)
    }

    private func getStatsEntry() -> StatsEntry {
        let sharedDefaults = UserDefaults(suiteName: "group.iit.calendar")
        
        let medStreak: Int
        let medMonth: Int
        if let medStatsRaw = sharedDefaults?.string(forKey: "meditation_stats"),
           let data = medStatsRaw.data(using: .utf8),
           let stats = try? JSONDecoder().decode(MeditationStats.self, from: data) {
            medStreak = stats.streak ?? 0
            medMonth = stats.monthMinutes ?? 0
        } else {
            medStreak = 0
            medMonth = 0
        }

        let chantStreak: Int
        let chantMonth: Int
        if let chantStatsRaw = sharedDefaults?.string(forKey: "chant_stats"),
           let data = chantStatsRaw.data(using: .utf8),
           let stats = try? JSONDecoder().decode(ChantStats.self, from: data) {
            chantStreak = stats.streak ?? 0
            chantMonth = stats.monthSessions ?? 0
        } else {
            chantStreak = 0
            chantMonth = 0
        }

        let studyStreak: Int
        let studyMonth: Int
        if let studyStatsRaw = sharedDefaults?.string(forKey: "study_stats"),
           let data = studyStatsRaw.data(using: .utf8),
           let stats = try? JSONDecoder().decode(StudyStats.self, from: data) {
            studyStreak = stats.streak ?? 0
            studyMonth = stats.monthMinutes ?? 0
        } else {
            studyStreak = 0
            studyMonth = 0
        }

        return StatsEntry(
            date: Date(),
            meditationStreak: medStreak,
            meditationMonth: medMonth,
            chantStreak: chantStreak,
            chantMonth: chantMonth,
            studyStreak: studyStreak,
            studyMonth: studyMonth
        )
    }
}

struct IITStatsWidgetView: View {
    var entry: StatsProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if family == .systemMedium {
            VStack(alignment: .leading, spacing: 8) {
                Text("My Stats")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.primary)

                HStack(alignment: .top, spacing: 10) {
                    // Meditation Column
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Meditation")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color(red: 25/255, green: 118/255, blue: 210/255))
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(entry.meditationStreak) days")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.primary)
                            Text("streak")
                                .font(.system(size: 10))
                                .foregroundColor(.secondary)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(entry.meditationMonth) min")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.primary)
                            Text("this month")
                                .font(.system(size: 10))
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    Divider()
                    
                    // Chaining Column
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Chanting")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color(red: 56/255, green: 142/255, blue: 60/255))
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(entry.chantStreak) days")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.primary)
                            Text("streak")
                                .font(.system(size: 10))
                                .foregroundColor(.secondary)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(entry.chantMonth) sessions")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.primary)
                            Text("this month")
                                .font(.system(size: 10))
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    Divider()
                    
                    // Studying Column
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Studying")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color(red: 245/255, green: 124/255, blue: 0/255))
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(entry.studyStreak) days")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.primary)
                            Text("streak")
                                .font(.system(size: 10))
                                .foregroundColor(.secondary)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(entry.studyMonth) min")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.primary)
                            Text("this month")
                                .font(.system(size: 10))
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(12)
        } else {
            VStack(alignment: .leading, spacing: 6) {
                Text("My Stats")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.primary)
                    .padding(.bottom, 2)

                // Meditation
                VStack(alignment: .leading, spacing: 1) {
                    Text("Meditation")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color(red: 25/255, green: 118/255, blue: 210/255))
                    HStack {
                        Text("\(entry.meditationStreak) d streak")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(entry.meditationMonth) min")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }
                }

                // Chanting
                VStack(alignment: .leading, spacing: 1) {
                    Text("Chanting")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color(red: 56/255, green: 142/255, blue: 60/255))
                    HStack {
                        Text("\(entry.chantStreak) d streak")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(entry.chantMonth) sess")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }
                }

                // Studying
                VStack(alignment: .leading, spacing: 1) {
                    Text("Studying")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color(red: 245/255, green: 124/255, blue: 0/255))
                    HStack {
                        Text("\(entry.studyStreak) d streak")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(entry.studyMonth) min")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(8)
        }
    }
}

struct IITStatsWidget: Widget {
    let kind: String = "IITStatsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StatsProvider()) { entry in
            if #available(iOS 17.0, *) {
                IITStatsWidgetView(entry: entry)
                    .containerBackground(Color(uiColor: .systemBackground), for: .widget)
            } else {
                IITStatsWidgetView(entry: entry)
                    .background(Color(uiColor: .systemBackground))
            }
        }
        .configurationDisplayName("My Stats")
        .description("Displays meditation, chanting, and study stats.")
        .supportedFamilies([.systemMedium, .systemSmall])
    }
}
