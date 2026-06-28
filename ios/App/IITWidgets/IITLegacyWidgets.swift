//
//  IITLegacyWidgets.swift
//  IITWidgets
//
//  Created by Antigravity.
//

import WidgetKit
import SwiftUI

struct LegacySimpleEntry: TimelineEntry {
    let date: Date
}

struct LegacyProvider: TimelineProvider {
    func placeholder(in context: Context) -> LegacySimpleEntry {
        LegacySimpleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (LegacySimpleEntry) -> ()) {
        let entry = LegacySimpleEntry(date: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LegacySimpleEntry>) -> ()) {
        var entries: [LegacySimpleEntry] = []
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = LegacySimpleEntry(date: entryDate)
            entries.append(entry)
        }
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct IITLegacyWidgetsEntryView: View {
    var entry: LegacyProvider.Entry

    var body: some View {
        VStack {
            Text("Time:")
            Text(entry.date, style: .time)
        }
    }
}

struct IITLegacyWidgets: Widget {
    let kind: String = "IITLegacyWidgets"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LegacyProvider()) { entry in
            if #available(iOS 17.0, *) {
                IITLegacyWidgetsEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                IITLegacyWidgetsEntryView(entry: entry)
                    .padding()
            }
        }
        .configurationDisplayName("IIT Legacy Widget")
        .description("This is an iOS 15/16 compatible widget.")
    }
}
