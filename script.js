const sections = {
  welcome:  { icon: 'fa-home',      title: 'Welcome',  width: 560, height: 340 },
  about:    { icon: 'fa-user',      title: 'About Me',   width: 620, height: 440 },
  projects: { icon: 'fa-code',      title: 'Projects',   width: 620, height: 420 },
  contact:  { icon: 'fa-envelope',  title: 'Contact',    width: 460, height: 280 },
}

class WindowManager {
  constructor() {
    this.windows = new Map()
    this.nextZ = 1
    this.windowTemplate = document.getElementById('window-template')
    this.container = document.getElementById('windows-container')
    this.tabsContainer = document.getElementById('tabs-container')
    this.activeId = null
    this.maximizedStates = new Map()
    this.init()
  }

  init() {
    this.initDesktopIcons()
    this.initStartMenu()
    this.initTrayClock()
    this.initOutsideClick()
    this.openWindow('welcome')
  }

  /* ---- Desktop Icons ---- */
  initDesktopIcons() {
    document.querySelectorAll('.desktop-icon').forEach(el => {
      el.addEventListener('dblclick', () => {
        const section = el.dataset.section
        const href = el.dataset.href
        if (href) { window.open(href, '_blank'); return }
        if (section) this.openWindow(section)
      })
    })
  }

  /* ---- Start Menu ---- */
  initStartMenu() {
    const btn = document.getElementById('start-btn')
    const menu = document.getElementById('start-menu')

    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      menu.classList.toggle('open')
    })

    menu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        menu.classList.remove('open')
        const section = item.dataset.section
        const href = item.dataset.href
        if (href) { window.open(href, '_blank'); return }
        if (section) this.openWindow(section)
      })
    })
  }

  initOutsideClick() {
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('start-menu')
      const btn = document.getElementById('start-btn')
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('open')
      }
    })
  }

  /* ---- Tray Clock ---- */
  initTrayClock() {
    const update = () => {
      const now = new Date()
      document.getElementById('tray-clock').textContent =
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0')
    }
    update()
    setInterval(update, 10000)
  }

  /* ---- Window Core ---- */
  openWindow(section) {
    const cfg = sections[section]
    if (!cfg) return

    const existing = this.findWindow(section)
    if (existing) {
      const w = this.windows.get(existing)
      if (w.minimized) this.restoreWindow(existing)
      this.focusWindow(existing)
      return existing
    }

    const id = 'win-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    const clone = this.windowTemplate.content.cloneNode(true)
    const el = clone.querySelector('.window')

    el.dataset.windowId = id
    const containerRect = this.container.getBoundingClientRect()
    el.style.width = Math.min(cfg.width, containerRect.width - 40) + 'px'
    el.style.height = Math.min(cfg.height, containerRect.height - 40) + 'px'

    const offset = this.windows.size * 30
    const left = Math.max(20, Math.min(60 + offset, containerRect.width - el.offsetWidth - 20))
    const top = Math.max(20, Math.min(60 + offset, containerRect.height - el.offsetHeight - 20))
    el.style.left = left + 'px'
    el.style.top = top + 'px'

    el.querySelector('.window-icon').className = 'window-icon fas ' + cfg.icon
    el.querySelector('.window-title').textContent = cfg.title

    const content = el.querySelector('.window-content')
    const template = document.getElementById('section-' + section)
    if (template) {
      content.appendChild(template.content.cloneNode(true))
    }

    this.container.appendChild(el)

    const state = {
      id, el, section, minimized: false, maximized: false,
      closed: false, zIndex: this.nextZ, prevRect: null
    }
    this.windows.set(id, state)

    this.bindWindowEvents(id)

    this.focusWindow(id)
    this.addTab(id)
    this.handleTypingEffect(id)
    this.handleWinOpeners(id)

    return id
  }

  findWindow(section) {
    for (const [id, w] of this.windows) {
      if (w.section === section && !w.closed) return id
    }
    return null
  }

  closeWindow(id) {
    const w = this.windows.get(id)
    if (!w) return
    w.closed = true
    w.el.remove()
    this.removeTab(id)
    this.windows.delete(id)

    if (this.activeId === id) {
      const remaining = [...this.windows.keys()]
      if (remaining.length > 0) {
        this.focusWindow(remaining[remaining.length - 1])
      } else {
        this.activeId = null
      }
    }
  }

  minimizeWindow(id) {
    const w = this.windows.get(id)
    if (!w || w.minimized) return
    w.minimized = true
    w.el.classList.add('minimized')
    this.updateTab(id)
    if (this.activeId === id) {
      const visible = [...this.windows.values()].find(ww => !ww.minimized && !ww.closed)
      if (visible) this.focusWindow(visible.id)
    }
  }

  restoreWindow(id) {
    const w = this.windows.get(id)
    if (!w || !w.minimized) return
    w.minimized = false
    w.el.classList.remove('minimized')
    this.updateTab(id)
    this.focusWindow(id)
  }

  toggleMaximize(id) {
    const w = this.windows.get(id)
    if (!w) return

    if (w.maximized) {
      w.el.classList.remove('maximized')
      const prev = this.maximizedStates.get(id)
      if (prev) {
        w.el.style.left = prev.left + 'px'
        w.el.style.top = prev.top + 'px'
        w.el.style.width = prev.width + 'px'
        w.el.style.height = prev.height + 'px'
      }
      w.maximized = false
    } else {
      this.maximizedStates.set(id, {
        left: parseInt(w.el.style.left),
        top: parseInt(w.el.style.top),
        width: parseInt(w.el.style.width),
        height: parseInt(w.el.style.height),
      })
      w.el.classList.add('maximized')
      w.el.style.left = '0'
      w.el.style.top = '0'
      w.el.style.width = '100%'
      w.el.style.height = '100%'
      w.maximized = true
    }
  }

  focusWindow(id) {
    const w = this.windows.get(id)
    if (!w || w.closed) return

    if (w.minimized) {
      this.restoreWindow(id)
      return
    }

    this.nextZ++
    w.zIndex = this.nextZ
    w.el.style.zIndex = w.zIndex

    if (this.activeId !== id) {
      this.activeId = id
      this.updateTabsActive()
    }
  }

  /* ---- Tab Management ---- */
  addTab(id) {
    const w = this.windows.get(id)
    if (!w) return
    const cfg = sections[w.section]

    const tab = document.createElement('button')
    tab.className = 'tab active'
    tab.dataset.windowId = id
    tab.innerHTML =
      '<i class="fas ' + cfg.icon + ' tab-icon"></i>' +
      '<span class="tab-title">' + cfg.title + '</span>'

    tab.addEventListener('click', () => this.handleTabClick(id))
    tab.addEventListener('mousedown', (e) => {
      if (e.button === 1) this.closeWindow(id)
    })

    this.tabsContainer.appendChild(tab)
  }

  removeTab(id) {
    const tab = this.tabsContainer.querySelector('.tab[data-window-id="' + id + '"]')
    if (tab) tab.remove()
  }

  updateTab(id) {
    const w = this.windows.get(id)
    const tab = this.tabsContainer.querySelector('.tab[data-window-id="' + id + '"]')
    if (!tab) return
    tab.classList.toggle('minimized', w && w.minimized)
  }

  updateTabsActive() {
    this.tabsContainer.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.windowId === this.activeId)
    })
  }

  handleTabClick(id) {
    const w = this.windows.get(id)
    if (!w) return

    if (w.minimized) {
      this.restoreWindow(id)
    } else if (this.activeId === id) {
      this.minimizeWindow(id)
    } else {
      this.focusWindow(id)
    }
  }

  /* ---- Window Events ---- */
  bindWindowEvents(id) {
    const w = this.windows.get(id)
    if (!w) return

    const el = w.el

    el.querySelector('.win-close').addEventListener('click', (e) => {
      e.stopPropagation()
      this.closeWindow(id)
    })
    el.querySelector('.win-min').addEventListener('click', (e) => {
      e.stopPropagation()
      this.minimizeWindow(id)
    })
    el.querySelector('.win-max').addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleMaximize(id)
    })

    el.addEventListener('mousedown', () => {
      this.focusWindow(id)
    })

    this.makeDraggable(id)
  }

  makeDraggable(id) {
    const w = this.windows.get(id)
    if (!w) return
    const el = w.el
    const titlebar = el.querySelector('.window-titlebar')

    let drag = false, startX, startY, startLeft, startTop

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return
      if (w.maximized) return
      drag = true
      const rect = el.getBoundingClientRect()
      startX = e.clientX
      startY = e.clientY
      startLeft = rect.left
      startTop = rect.top
      el.style.cursor = 'grabbing'
      e.preventDefault()
    })

    document.addEventListener('mousemove', (e) => {
      if (!drag) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      let newLeft = startLeft + dx
      let newTop = startTop + dy
      const containerRect = this.container.getBoundingClientRect()
      newLeft = Math.max(-el.offsetWidth + 60, Math.min(containerRect.width - 40, newLeft))
      newTop = Math.max(0, Math.min(containerRect.height - 40, newTop))
      el.style.left = newLeft + 'px'
      el.style.top = newTop + 'px'
    })

    document.addEventListener('mouseup', () => {
      if (drag) {
        drag = false
        el.style.cursor = ''
      }
    })
  }

  /* ---- Typing Effect ---- */
  handleTypingEffect(id) {
    const w = this.windows.get(id)
    if (!w) return
    const el = w.el
    const typingEl = el.querySelector('.typing-text')
    if (!typingEl) return

    const phrases = ['Tools.', 'Applications.', 'Solutions.']
    let phraseIndex = 0
    let charIndex = 0
    let isDeleting = false
    let typeSpeed = 100

    const type = () => {
      const current = phrases[phraseIndex]
      if (isDeleting) {
        typingEl.textContent = current.substring(0, charIndex - 1)
        charIndex--
        typeSpeed = 50
      } else {
        typingEl.textContent = current.substring(0, charIndex + 1)
        charIndex++
        typeSpeed = 100
      }
      if (!isDeleting && charIndex === current.length) {
        isDeleting = true
        typeSpeed = 2000
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        phraseIndex = (phraseIndex + 1) % phrases.length
        typeSpeed = 500
      }
      setTimeout(type, typeSpeed)
    }
    type()
  }

  /* ---- Window Opener Buttons ---- */
  handleWinOpeners(id) {
    const w = this.windows.get(id)
    if (!w) return
    w.el.querySelectorAll('.win-opener').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openWindow(btn.dataset.section)
      })
    })
  }
}

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', () => {
  new WindowManager()
})
