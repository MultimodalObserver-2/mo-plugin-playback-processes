import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'

import ProcessesVisualizationPlugin from '../main'
import { ProcessesPreview } from '../components/ProcessesPreview'
import { ProcessesView } from '../components/ProcessesView'
import properties from '../properties'

function makeControls() {
  return {
    onPlay:  vi.fn().mockReturnValue(() => {}),
    onPause: vi.fn().mockReturnValue(() => {}),
    onSeek:  vi.fn().mockReturnValue(() => {}),
    onSync:  vi.fn().mockReturnValue(() => {}),
  }
}

function makeContext(filePath = '/test/processes.json') {
  return { filePath, captureStartTimestamp: 0, fileCaptureStartTimestamp: 0, pauseIntervals: [] }
}

const PROC_A = { pid: 1234, userName: 'user', startInstant: '2024-01-01T10:00:00Z', totalCpuDuration: 1520, command: 'C:\\Windows\\node.exe', parentPid: 980, hasChildren: 0, supportsNormalTermination: 1 }
const PROC_B = { pid: 5678, userName: 'admin', startInstant: '2024-01-01T09:00:00Z', totalCpuDuration: 8430, command: '/usr/bin/chrome', parentPid: 1, hasChildren: 1, supportsNormalTermination: 1 }
const SNAPSHOT_1 = { captureTimestamp: 1, processes: [PROC_A] }
const SNAPSHOT_2 = { captureTimestamp: 2, processes: [PROC_B] }

function mockFetch(data: unknown, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as any)
}

describe('ProcessesVisualizationPlugin', () => {
  let plugin: ProcessesVisualizationPlugin

  beforeEach(() => { plugin = new ProcessesVisualizationPlugin() })

  it('instance', () => {
    expect(plugin).toBeDefined()
  })

  it('extensions json', () => {
    expect(plugin.validExtensions()).toContain('json')
  })

  it('descriptor null false', () => {
    expect(plugin.validateCaptureDescriptor(null)).toBe(false)
  })

  it('descriptor processes_snapshot_array', () => {
    expect(plugin.validateCaptureDescriptor({ format: 'processes_snapshot_array' })).toBe(true)
  })

  it('descriptor wrong format false', () => {
    expect(plugin.validateCaptureDescriptor({ format: 'audio' })).toBe(false)
  })

  it('descriptor empty false', () => {
    expect(plugin.validateCaptureDescriptor({})).toBe(false)
  })

  it('getView', () => {
    mockFetch([])
    const el = plugin.getView({ controls: makeControls(), context: makeContext(), settings: {} } as any)
    expect(el).not.toBeNull()
  })

  it('getPreview', () => {
    expect(plugin.getPreview()).not.toBeNull()
  })
})

describe('properties', () => {
  it('defined', () => {
    expect(properties).toBeDefined()
  })
})

describe('Preview', () => {
  it('renders', () => {
    const { container } = render(<ProcessesPreview />)
    expect(container.firstChild).not.toBeNull()
  })

  it('table', () => {
    const { container } = render(<ProcessesPreview />)
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('6 header columns', () => {
    const { container } = render(<ProcessesPreview />)
    const headers = container.querySelectorAll('thead th')
    expect(headers.length).toBe(6)
  })

  it('3 sample rows', () => {
    const { container } = render(<ProcessesPreview />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(3)
  })

  it('node.exe', () => {
    const { container } = render(<ProcessesPreview />)
    expect(container.textContent).toContain('node.exe')
  })
})

describe('View', () => {
  afterEach(() => { vi.restoreAllMocks() })

  it('renders', async () => {
    mockFetch([])
    const { container } = await act(async () =>
      render(<ProcessesView controls={makeControls()} context={makeContext()} settings={{}} />)
    )
    expect(container.firstChild).not.toBeNull()
  })

  it('loading state', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { getByText } = render(<ProcessesView controls={makeControls()} context={makeContext()} settings={{}} />)
    expect(getByText('loading')).not.toBeNull()
  })

  it('table data', async () => {
    mockFetch([SNAPSHOT_1])
    const { container } = await act(async () =>
      render(<ProcessesView controls={makeControls()} context={makeContext()} settings={{}} />)
    )
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('fetch error not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: vi.fn() } as any)
    const { container } = await act(async () =>
      render(<ProcessesView controls={makeControls()} context={makeContext()} settings={{}} />)
    )
    expect(container.textContent).toContain('Failed to load')
  })

  it('fetch error throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))
    const { container } = await act(async () =>
      render(<ProcessesView controls={makeControls()} context={makeContext()} settings={{}} />)
    )
    expect(container.textContent).toContain('network error')
  })

  it('play handler', async () => {
    mockFetch([SNAPSHOT_1])
    const controls = makeControls()
    await act(async () => render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />))
    expect(controls.onPlay).toHaveBeenCalled()
  })

  it('pause handler', async () => {
    mockFetch([SNAPSHOT_1])
    const controls = makeControls()
    await act(async () => render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />))
    expect(controls.onPause).toHaveBeenCalled()
  })

  it('seek handler', async () => {
    mockFetch([SNAPSHOT_1])
    const controls = makeControls()
    await act(async () => render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />))
    expect(controls.onSeek).toHaveBeenCalled()
  })

  it('sync handler', async () => {
    mockFetch([SNAPSHOT_1])
    const controls = makeControls()
    await act(async () => render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />))
    expect(controls.onSync).toHaveBeenCalled()
  })

  it('cleanup unmount', async () => {
    mockFetch([SNAPSHOT_1])
    const unsub = vi.fn()
    const controls = {
      onPlay:  vi.fn().mockReturnValue(unsub),
      onPause: vi.fn().mockReturnValue(unsub),
      onSeek:  vi.fn().mockReturnValue(unsub),
      onSync:  vi.fn().mockReturnValue(unsub),
    }
    let unmount!: () => void
    await act(async () => { ({ unmount } = render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)) })
    act(() => { unmount() })
    expect(unsub).toHaveBeenCalled()
  })

  it('snapshot seek time', async () => {
    mockFetch([SNAPSHOT_1, SNAPSHOT_2])
    let seekCb: ((ts: number) => void) | undefined
    const controls = {
      onPlay:  vi.fn().mockReturnValue(() => {}),
      onPause: vi.fn().mockReturnValue(() => {}),
      onSeek:  vi.fn().mockImplementation((cb) => { seekCb = cb; return () => {} }),
      onSync:  vi.fn().mockReturnValue(() => {}),
    }
    const { container } = await act(async () =>
      render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)
    )
    await act(async () => { seekCb?.(1500) })
    expect(container.textContent).toContain('1234')
  })

  it('latest snapshot seek', async () => {
    mockFetch([SNAPSHOT_1, SNAPSHOT_2])
    let seekCb: ((ts: number) => void) | undefined
    const controls = {
      onPlay:  vi.fn().mockReturnValue(() => {}),
      onPause: vi.fn().mockReturnValue(() => {}),
      onSeek:  vi.fn().mockImplementation((cb) => { seekCb = cb; return () => {} }),
      onSync:  vi.fn().mockReturnValue(() => {}),
    }
    const { container } = await act(async () =>
      render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)
    )
    await act(async () => { seekCb?.(2500) })
    expect(container.textContent).toContain('5678')
  })

  it('no data before snapshots', async () => {
    mockFetch([SNAPSHOT_1])
    let seekCb: ((ts: number) => void) | undefined
    const controls = {
      onPlay:  vi.fn().mockReturnValue(() => {}),
      onPause: vi.fn().mockReturnValue(() => {}),
      onSeek:  vi.fn().mockImplementation((cb) => { seekCb = cb; return () => {} }),
      onSync:  vi.fn().mockReturnValue(() => {}),
    }
    const { container } = await act(async () =>
      render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)
    )
    await act(async () => { seekCb?.(500) })
    expect(container.textContent).toContain('noData')
  })

  it('sync snapshot', async () => {
    mockFetch([SNAPSHOT_1])
    let syncCb: ((ts: number) => void) | undefined
    const controls = {
      onPlay:  vi.fn().mockReturnValue(() => {}),
      onPause: vi.fn().mockReturnValue(() => {}),
      onSeek:  vi.fn().mockReturnValue(() => {}),
      onSync:  vi.fn().mockImplementation((cb) => { syncCb = cb; return () => {} }),
    }
    const { container } = await act(async () =>
      render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)
    )
    await act(async () => { syncCb?.(1500) })
    expect(container.textContent).toContain('1234')
  })

  it('appName windows path', async () => {
    const snap = { captureTimestamp: 0, processes: [{ ...PROC_A, command: 'C:\\Windows\\System32\\notepad.exe' }] }
    mockFetch([snap])
    let seekCb: ((ts: number) => void) | undefined
    const controls = {
      onPlay:  vi.fn().mockReturnValue(() => {}),
      onPause: vi.fn().mockReturnValue(() => {}),
      onSeek:  vi.fn().mockImplementation((cb) => { seekCb = cb; return () => {} }),
      onSync:  vi.fn().mockReturnValue(() => {}),
    }
    const { container } = await act(async () =>
      render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)
    )
    await act(async () => { seekCb?.(100) })
    expect(container.textContent).toContain('notepad.exe')
    expect(container.textContent).not.toContain('C:\\Windows')
  })

  it('appName unix path', async () => {
    const snap = { captureTimestamp: 0, processes: [{ ...PROC_B, command: '/usr/local/bin/python3' }] }
    mockFetch([snap])
    let seekCb: ((ts: number) => void) | undefined
    const controls = {
      onPlay:  vi.fn().mockReturnValue(() => {}),
      onPause: vi.fn().mockReturnValue(() => {}),
      onSeek:  vi.fn().mockImplementation((cb) => { seekCb = cb; return () => {} }),
      onSync:  vi.fn().mockReturnValue(() => {}),
    }
    const { container } = await act(async () =>
      render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)
    )
    await act(async () => { seekCb?.(100) })
    expect(container.textContent).toContain('python3')
  })

  it('appName null command', async () => {
    const snap = { captureTimestamp: 0, processes: [{ ...PROC_A, command: null }] }
    mockFetch([snap])
    let seekCb: ((ts: number) => void) | undefined
    const controls = {
      onPlay:  vi.fn().mockReturnValue(() => {}),
      onPause: vi.fn().mockReturnValue(() => {}),
      onSeek:  vi.fn().mockImplementation((cb) => { seekCb = cb; return () => {} }),
      onSync:  vi.fn().mockReturnValue(() => {}),
    }
    const { container } = await act(async () =>
      render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)
    )
    await act(async () => { seekCb?.(100) })
    expect(container.textContent).toContain('-')
  })

  it('snapshots sorted', async () => {
    mockFetch([SNAPSHOT_2, SNAPSHOT_1])
    let seekCb: ((ts: number) => void) | undefined
    const controls = {
      onPlay:  vi.fn().mockReturnValue(() => {}),
      onPause: vi.fn().mockReturnValue(() => {}),
      onSeek:  vi.fn().mockImplementation((cb) => { seekCb = cb; return () => {} }),
      onSync:  vi.fn().mockReturnValue(() => {}),
    }
    const { container } = await act(async () =>
      render(<ProcessesView controls={controls} context={makeContext()} settings={{}} />)
    )
    await act(async () => { seekCb?.(1500) })
    expect(container.textContent).toContain('1234')
    expect(container.textContent).not.toContain('5678')
  })
})
