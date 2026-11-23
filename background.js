// Opens the generator docked in the browser and keeps it open until the user closes it.
//  - Chrome, Edge and other Chromium browsers: side panel (fits the browser height, stays open across tabs)
//  - Firefox: sidebar
//  - Anything else: a separate window that stays open
const ext = typeof browser !== 'undefined' ? browser : chrome;
const W = 500, H = 940;

async function openWindow() {
  const { winId } = await ext.storage.local.get('winId');
  if (winId) { try { await ext.windows.update(winId, { focused: true }); return; } catch (e) { /* window was closed */ } }
  let left, top;
  try {
    const cur = await ext.windows.getLastFocused();
    if (cur.left != null && cur.width) { left = Math.max(0, cur.left + cur.width - W - 16); top = (cur.top || 0) + 40; }
  } catch (e) {}
  const w = await ext.windows.create({ url: ext.runtime.getURL('popup.html'), type: 'popup', width: W, height: H, left, top });
  await ext.storage.local.set({ winId: w.id });
}

if (ext.sidePanel && ext.sidePanel.setPanelBehavior) {
  ext.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
} else if (ext.sidebarAction && ext.sidebarAction.toggle) {
  ext.action.onClicked.addListener(() => ext.sidebarAction.toggle());
} else {
  ext.action.onClicked.addListener(openWindow);
  ext.windows.onRemoved.addListener(async (id) => {
    const { winId } = await ext.storage.local.get('winId');
    if (winId === id) await ext.storage.local.remove('winId');
  });
}

// The × button in the panel asks us to close it (older Chrome has no sidePanel.close)
ext.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'closePanel' && ext.sidePanel && ext.sidePanel.setOptions) {
    ext.sidePanel.setOptions({ enabled: false }).then(() => setTimeout(() => ext.sidePanel.setOptions({ enabled: true }), 400));
  }
});
