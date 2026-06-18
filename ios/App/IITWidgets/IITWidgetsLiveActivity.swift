//
//  IITWidgetsLiveActivity.swift
//  IITWidgets
//
//  Created by totden on 16/6/26.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct IITWidgetsAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct IITWidgetsLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: IITWidgetsAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension IITWidgetsAttributes {
    fileprivate static var preview: IITWidgetsAttributes {
        IITWidgetsAttributes(name: "World")
    }
}

extension IITWidgetsAttributes.ContentState {
    fileprivate static var smiley: IITWidgetsAttributes.ContentState {
        IITWidgetsAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: IITWidgetsAttributes.ContentState {
         IITWidgetsAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: IITWidgetsAttributes.preview) {
   IITWidgetsLiveActivity()
} contentStates: {
    IITWidgetsAttributes.ContentState.smiley
    IITWidgetsAttributes.ContentState.starEyes
}
