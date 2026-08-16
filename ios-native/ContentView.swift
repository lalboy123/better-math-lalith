//
//  ContentView.swift
//  MathLift
//
//  Created by Lalith Durbhakula on 5/13/26.
//
//  Paste this entire file over ContentView.swift in Xcode.
//  It wraps https://better-math-lalith.vercel.app in real iOS chrome:
//  offline screen, native spinner, header + tab bar, and Taptic Engine haptics.
//

import SwiftUI
import WebKit
import Network

private let mathLiftRoot = URL(string: "https://better-math-lalith.vercel.app")!

private enum MathLiftTab: String, CaseIterable, Identifiable {
    case home
    case classes
    case settings

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home: return "Home"
        case .classes: return "Classes"
        case .settings: return "Settings"
        }
    }

    var systemImage: String {
        switch self {
        case .home: return "house.fill"
        case .classes: return "person.3.fill"
        case .settings: return "gearshape.fill"
        }
    }

    var path: String {
        switch self {
        case .home: return "/"
        case .classes: return "/planets"
        case .settings: return "/settings"
        }
    }
}

final class ConnectivityMonitor: ObservableObject {
    @Published var isOnline = true

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "MathLift.Network")

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isOnline = path.status == .satisfied
            }
        }
        monitor.start(queue: queue)
    }

    deinit {
        monitor.cancel()
    }
}

struct ContentView: View {
    @StateObject private var connectivity = ConnectivityMonitor()
    @State private var selectedTab: MathLiftTab = .home
    @State private var isLoading = true
    @State private var loadFailed = false
    @State private var reloadToken = 0
    @State private var canGoBack = false

    private var showOffline: Bool {
        !connectivity.isOnline || loadFailed
    }

    var body: some View {
        VStack(spacing: 0) {
            nativeHeader

            ZStack {
                MathLiftWebView(
                    selectedTab: selectedTab,
                    reloadToken: reloadToken,
                    isOnline: connectivity.isOnline,
                    onLoadingChange: { loading in
                        isLoading = loading
                        if loading {
                            loadFailed = false
                        }
                    },
                    onLoadFailed: {
                        isLoading = false
                        loadFailed = true
                    },
                    onCanGoBackChange: { canGoBack = $0 }
                )
                .opacity(showOffline ? 0 : 1)

                if isLoading && !showOffline {
                    LoadingScreen()
                }

                if showOffline {
                    OfflineScreen {
                        loadFailed = false
                        isLoading = true
                        reloadToken += 1
                    }
                }
            }

            nativeTabBar
        }
        .background(Color(red: 24 / 255, green: 27 / 255, blue: 46 / 255).ignoresSafeArea())
        .preferredColorScheme(.dark)
        .onReceive(connectivity.$isOnline.dropFirst()) { online in
            if online {
                loadFailed = false
                isLoading = true
                reloadToken += 1
            }
        }
    }

    private var nativeHeader: some View {
        HStack {
            Button {
                NotificationCenter.default.post(name: .mathLiftGoBack, object: nil)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.body.weight(.semibold))
                    .opacity(canGoBack ? 1 : 0.35)
            }
            .disabled(!canGoBack)
            .accessibilityLabel("Back")

            Spacer()

            Text("MathLift")
                .font(.headline)

            Spacer()

            Color.clear.frame(width: 22, height: 22)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.bar)
    }

    private var nativeTabBar: some View {
        HStack(spacing: 0) {
            ForEach(MathLiftTab.allCases) { tab in
                Button {
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    selectedTab = tab
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: tab.systemImage)
                            .font(.system(size: 20))
                        Text(tab.title)
                            .font(.caption2.weight(.semibold))
                    }
                    .foregroundStyle(selectedTab == tab ? Color.accentColor : Color.secondary)
                    .frame(maxWidth: .infinity)
                    .padding(.top, 8)
                    .padding(.bottom, 4)
                }
                .accessibilityLabel(tab.title)
            }
        }
        .padding(.bottom, 2)
        .background(.bar)
    }
}

private struct LoadingScreen: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .progressViewStyle(.circular)
                .scaleEffect(1.3)
                .tint(.white)
            Text("Loading MathLift")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.white.opacity(0.85))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 24 / 255, green: 27 / 255, blue: 46 / 255))
    }
}

private struct OfflineScreen: View {
    let onRetry: () -> Void

    var body: some View {
        VStack(spacing: 18) {
            Image(systemName: "wifi.slash")
                .font(.system(size: 44, weight: .medium))
                .foregroundStyle(.white.opacity(0.9))
            Text("No Internet Connection")
                .font(.title2.weight(.semibold))
                .multilineTextAlignment(.center)
            Text("MathLift needs a connection to load your class. Check Wi‑Fi or cellular, then try again.")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.75))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 28)
            Button("Try Again", action: onRetry)
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 24 / 255, green: 27 / 255, blue: 46 / 255))
    }
}

private struct MathLiftWebView: UIViewRepresentable {
    let selectedTab: MathLiftTab
    let reloadToken: Int
    let isOnline: Bool
    let onLoadingChange: (Bool) -> Void
    let onLoadFailed: () -> Void
    let onCanGoBackChange: (Bool) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.userContentController.add(context.coordinator, name: "mathlift")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 24 / 255, green: 27 / 255, blue: 46 / 255, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        context.coordinator.webView = webView
        context.coordinator.load(path: selectedTab.path, force: true)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.parent = self
        context.coordinator.webView = webView
        context.coordinator.apply(tab: selectedTab, reloadToken: reloadToken, isOnline: isOnline)
    }

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "mathlift")
        NotificationCenter.default.removeObserver(coordinator)
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var parent: MathLiftWebView
        weak var webView: WKWebView?
        private var lastTabPath: String?
        private var lastReloadToken = -1

        init(_ parent: MathLiftWebView) {
            self.parent = parent
            super.init()
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(goBack),
                name: .mathLiftGoBack,
                object: nil
            )
        }

        func apply(tab: MathLiftTab, reloadToken: Int, isOnline: Bool) {
            if reloadToken != lastReloadToken {
                lastReloadToken = reloadToken
                lastTabPath = tab.path
                if isOnline {
                    load(path: tab.path, force: true)
                }
                return
            }
            if tab.path != lastTabPath {
                lastTabPath = tab.path
                navigateInApp(to: tab.path)
            }
        }

        func load(path: String, force: Bool) {
            guard let webView else { return }
            let url = mathLiftRoot.appendingPathComponent(String(path.drop(while: { $0 == "/" })))
            let target = path == "/" ? mathLiftRoot : url
            if !force, webView.url?.host == target.host, webView.isLoading { return }
            parent.onLoadingChange(true)
            webView.load(URLRequest(url: target, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 30))
        }

        private func navigateInApp(to path: String) {
            guard let webView else { return }
            let escaped = path.replacingOccurrences(of: "'", with: "\\'")
            let js = """
            (function() {
              try {
                window.dispatchEvent(new CustomEvent('mathlift-navigate', { detail: { path: '\(escaped)' } }));
              } catch (e) {}
            })();
            """
            webView.evaluateJavaScript(js) { [weak self] _, error in
                if error != nil {
                    self?.load(path: path, force: true)
                }
            }
        }

        @objc private func goBack() {
            guard let webView else { return }
            if webView.canGoBack {
                webView.goBack()
            } else {
                webView.evaluateJavaScript("history.back()")
            }
        }

        func userContentController(
            _ userContentController: WKUserContentController,
            didReceive message: WKScriptMessage
        ) {
            guard message.name == "mathlift" else { return }
            var style = "light"
            if let body = message.body as? [String: Any] {
                style = (body["style"] as? String) ?? style
            } else if let body = message.body as? String {
                style = body
            }
            DispatchQueue.main.async {
                switch style {
                case "success":
                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                case "error":
                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                case "medium":
                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                default:
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
            }
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            parent.onLoadingChange(true)
            parent.onCanGoBackChange(webView.canGoBack)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.onLoadingChange(false)
            parent.onCanGoBackChange(webView.canGoBack)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            handleFailure(error)
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation!,
            withError error: Error
        ) {
            handleFailure(error)
        }

        private func handleFailure(_ error: Error) {
            let nsError = error as NSError
            if nsError.domain == NSURLErrorDomain && nsError.code == NSURLErrorCancelled {
                return
            }
            parent.onLoadFailed()
        }
    }
}

private extension Notification.Name {
    static let mathLiftGoBack = Notification.Name("MathLiftGoBack")
}

#Preview {
    ContentView()
}
