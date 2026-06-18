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
        IITWidgets()
        IITWidgetsControl()
        IITWidgetsLiveActivity()
    }
}
