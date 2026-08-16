import UIKit
import WebKit
import Network
import Capacitor

/// Native chrome around the Capacitor WebView: spinner, offline screen, header, tab bar, haptics.
final class NativeShellViewController: UIViewController, UITabBarDelegate, WKScriptMessageHandler {
    private let bridgeController = CAPBridgeViewController()
    private let header = UIView()
    private let titleLabel = UILabel()
    private let backButton = UIButton(type: .system)
    private let tabBar = UITabBar()
    private let contentContainer = UIView()
    private let spinner = UIActivityIndicatorView(style: .large)
    private let loadingLabel = UILabel()
    private let loadingView = UIView()
    private let offlineView = UIView()
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "MathLift.Network")
    private var attachedWebView = false
    private var isOnline = true
    private var loadFailed = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 24 / 255, green: 27 / 255, blue: 46 / 255, alpha: 1)
        setupChrome()
        embedBridge()
        setupOffline()
        setupLoading()
        startNetworkMonitor()
        showLoading(true)
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        attachToWebViewIfNeeded()
    }

    private func setupChrome() {
        header.translatesAutoresizingMaskIntoConstraints = false
        header.backgroundColor = UIColor.secondarySystemBackground
        view.addSubview(header)

        backButton.translatesAutoresizingMaskIntoConstraints = false
        backButton.setImage(UIImage(systemName: "chevron.left"), for: .normal)
        backButton.accessibilityLabel = "Back"
        backButton.addTarget(self, action: #selector(goBack), for: .touchUpInside)
        header.addSubview(backButton)

        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.text = "MathLift"
        titleLabel.font = .preferredFont(forTextStyle: .headline)
        titleLabel.textAlignment = .center
        header.addSubview(titleLabel)

        contentContainer.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(contentContainer)

        tabBar.translatesAutoresizingMaskIntoConstraints = false
        tabBar.delegate = self
        tabBar.items = [
            UITabBarItem(title: "Home", image: UIImage(systemName: "house.fill"), tag: 0),
            UITabBarItem(title: "Classes", image: UIImage(systemName: "person.3.fill"), tag: 1),
            UITabBarItem(title: "Settings", image: UIImage(systemName: "gearshape.fill"), tag: 2),
        ]
        tabBar.selectedItem = tabBar.items?.first
        view.addSubview(tabBar)

        NSLayoutConstraint.activate([
            header.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            header.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            header.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            header.heightAnchor.constraint(equalToConstant: 44),

            backButton.leadingAnchor.constraint(equalTo: header.leadingAnchor, constant: 12),
            backButton.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            backButton.widthAnchor.constraint(equalToConstant: 32),

            titleLabel.centerXAnchor.constraint(equalTo: header.centerXAnchor),
            titleLabel.centerYAnchor.constraint(equalTo: header.centerYAnchor),

            tabBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tabBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tabBar.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentContainer.topAnchor.constraint(equalTo: header.bottomAnchor),
            contentContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            contentContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            contentContainer.bottomAnchor.constraint(equalTo: tabBar.topAnchor),
        ])
    }

    private func embedBridge() {
        addChild(bridgeController)
        bridgeController.view.translatesAutoresizingMaskIntoConstraints = false
        contentContainer.addSubview(bridgeController.view)
        NSLayoutConstraint.activate([
            bridgeController.view.topAnchor.constraint(equalTo: contentContainer.topAnchor),
            bridgeController.view.leadingAnchor.constraint(equalTo: contentContainer.leadingAnchor),
            bridgeController.view.trailingAnchor.constraint(equalTo: contentContainer.trailingAnchor),
            bridgeController.view.bottomAnchor.constraint(equalTo: contentContainer.bottomAnchor),
        ])
        bridgeController.didMove(toParent: self)
    }

    private func setupLoading() {
        loadingView.translatesAutoresizingMaskIntoConstraints = false
        loadingView.backgroundColor = UIColor(red: 24 / 255, green: 27 / 255, blue: 46 / 255, alpha: 1)
        contentContainer.addSubview(loadingView)

        spinner.translatesAutoresizingMaskIntoConstraints = false
        spinner.color = .white
        spinner.startAnimating()
        loadingView.addSubview(spinner)

        loadingLabel.translatesAutoresizingMaskIntoConstraints = false
        loadingLabel.text = "Loading MathLift"
        loadingLabel.textColor = UIColor.white.withAlphaComponent(0.85)
        loadingLabel.font = .preferredFont(forTextStyle: .subheadline)
        loadingView.addSubview(loadingLabel)

        NSLayoutConstraint.activate([
            loadingView.topAnchor.constraint(equalTo: contentContainer.topAnchor),
            loadingView.leadingAnchor.constraint(equalTo: contentContainer.leadingAnchor),
            loadingView.trailingAnchor.constraint(equalTo: contentContainer.trailingAnchor),
            loadingView.bottomAnchor.constraint(equalTo: contentContainer.bottomAnchor),
            spinner.centerXAnchor.constraint(equalTo: loadingView.centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: loadingView.centerYAnchor, constant: -12),
            loadingLabel.topAnchor.constraint(equalTo: spinner.bottomAnchor, constant: 16),
            loadingLabel.centerXAnchor.constraint(equalTo: loadingView.centerXAnchor),
        ])
    }

    private func setupOffline() {
        offlineView.translatesAutoresizingMaskIntoConstraints = false
        offlineView.backgroundColor = UIColor(red: 24 / 255, green: 27 / 255, blue: 46 / 255, alpha: 1)
        offlineView.isHidden = true
        contentContainer.addSubview(offlineView)

        let icon = UIImageView(image: UIImage(systemName: "wifi.slash"))
        icon.translatesAutoresizingMaskIntoConstraints = false
        icon.tintColor = .white
        icon.contentMode = .scaleAspectFit

        let title = UILabel()
        title.translatesAutoresizingMaskIntoConstraints = false
        title.text = "No Internet Connection"
        title.textColor = .white
        title.font = .preferredFont(forTextStyle: .title2)
        title.textAlignment = .center

        let body = UILabel()
        body.translatesAutoresizingMaskIntoConstraints = false
        body.text = "MathLift needs a connection to load your class. Check Wi‑Fi or cellular, then try again."
        body.textColor = UIColor.white.withAlphaComponent(0.75)
        body.font = .preferredFont(forTextStyle: .subheadline)
        body.textAlignment = .center
        body.numberOfLines = 0

        let retry = UIButton(type: .system)
        retry.translatesAutoresizingMaskIntoConstraints = false
        retry.setTitle("Try Again", for: .normal)
        retry.titleLabel?.font = .preferredFont(forTextStyle: .headline)
        retry.addTarget(self, action: #selector(retryTapped), for: .touchUpInside)

        let stack = UIStackView(arrangedSubviews: [icon, title, body, retry])
        stack.translatesAutoresizingMaskIntoConstraints = false
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 16
        offlineView.addSubview(stack)

        NSLayoutConstraint.activate([
            offlineView.topAnchor.constraint(equalTo: contentContainer.topAnchor),
            offlineView.leadingAnchor.constraint(equalTo: contentContainer.leadingAnchor),
            offlineView.trailingAnchor.constraint(equalTo: contentContainer.trailingAnchor),
            offlineView.bottomAnchor.constraint(equalTo: contentContainer.bottomAnchor),
            icon.widthAnchor.constraint(equalToConstant: 44),
            icon.heightAnchor.constraint(equalToConstant: 44),
            body.leadingAnchor.constraint(equalTo: offlineView.leadingAnchor, constant: 28),
            body.trailingAnchor.constraint(equalTo: offlineView.trailingAnchor, constant: -28),
            stack.centerXAnchor.constraint(equalTo: offlineView.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: offlineView.centerYAnchor),
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: offlineView.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: offlineView.trailingAnchor, constant: -24),
        ])
    }

    private func startNetworkMonitor() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                let online = path.status == .satisfied
                let recovered = !(self?.isOnline ?? true) && online
                self?.isOnline = online
                if online {
                    self?.loadFailed = false
                }
                self?.updateOfflineVisibility()
                if recovered {
                    self?.reloadWeb()
                }
            }
        }
        monitor.start(queue: monitorQueue)
    }

    private func attachToWebViewIfNeeded() {
        guard !attachedWebView else { return }
        guard let webView = bridgeController.webView else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
                self?.attachToWebViewIfNeeded()
            }
            return
        }
        attachedWebView = true
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "mathlift")
        webView.configuration.userContentController.add(self, name: "mathlift")
        webView.addObserver(self, forKeyPath: "loading", options: [.new], context: nil)
        showLoading(webView.isLoading)
    }

    override func observeValue(
        forKeyPath keyPath: String?,
        of object: Any?,
        change: [NSKeyValueChangeKey: Any]?,
        context: UnsafeMutableRawPointer?
    ) {
        if keyPath == "loading" {
            let loading = (change?[.newKey] as? Bool) ?? bridgeController.webView?.isLoading ?? false
            DispatchQueue.main.async { [weak self] in
                self?.showLoading(loading)
            }
            return
        }
        super.observeValue(forKeyPath: keyPath, of: object, change: change, context: context)
    }

    deinit {
        monitor.cancel()
        if attachedWebView {
            bridgeController.webView?.removeObserver(self, forKeyPath: "loading")
            bridgeController.webView?.configuration.userContentController
                .removeScriptMessageHandler(forName: "mathlift")
        }
    }

    private func showLoading(_ loading: Bool) {
        loadingView.isHidden = !loading || !offlineView.isHidden
        if loading {
            spinner.startAnimating()
        } else {
            spinner.stopAnimating()
        }
    }

    private func updateOfflineVisibility() {
        let show = !isOnline || loadFailed
        offlineView.isHidden = !show
        if show {
            loadingView.isHidden = true
        }
    }

    @objc private func retryTapped() {
        loadFailed = false
        updateOfflineVisibility()
        reloadWeb()
    }

    private func reloadWeb() {
        showLoading(true)
        bridgeController.webView?.reload()
    }

    @objc private func goBack() {
        if let webView = bridgeController.webView, webView.canGoBack {
            webView.goBack()
        } else {
            bridgeController.webView?.evaluateJavaScript("history.back()")
        }
    }

    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        let path: String
        switch item.tag {
        case 1: path = "/planets"
        case 2: path = "/settings"
        default: path = "/"
        }
        let js = """
        window.dispatchEvent(new CustomEvent('mathlift-navigate', { detail: { path: '\(path)' } }));
        """
        bridgeController.webView?.evaluateJavaScript(js)
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "mathlift" else { return }
        var style = "light"
        if let body = message.body as? [String: Any] {
            style = (body["style"] as? String) ?? style
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
}
