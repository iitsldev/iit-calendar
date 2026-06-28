//
//  IITWidgetsBundle.swift
//  IITWidgets
//
//  Created by totden on 16/6/26.
//

import WidgetKit
import SwiftUI

@main
struct IITWidgetsBundle: WidgetBundle {
    var body: some Widget {
        IITLegacyWidgets()
        if #available(iOS 17.0, *) {
            IITWidgets()
        }
        #if compiler(>=6.0)
        if #available(iOS 18.0, *) {
            IITWidgetsControl()
        }
        #endif
        if #available(iOS 16.1, *) {
            IITWidgetsLiveActivity()
        }
    }
}
