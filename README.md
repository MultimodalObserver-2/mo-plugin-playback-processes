# Processes Visualization Plugin

A Playback plugin for [**Multimodal Observer**](https://github.com/MultimodalObserver-2/mo) that displays periodic snapshots of running system processes synchronized with the session timeline.

## Features

- **Process table** showing all running processes at the current playback position
- **Columns displayed**: application name, PID, username, start time, total CPU duration, and parent PID
- **Timeline synchronization** — updates on play, pause, and seek
- **Snapshot navigation** — always shows the most recent snapshot recorded before the playback cursor

## Supported Formats

- `.json`

The plugin accepts JSON files produced by the [Processes Capture Plugin](../mo-plugin-capture-processes/).

## Configuration Options

This plugin has no configurable properties.

## How It Works

- Reads the JSON recording file and parses all timestamped process snapshots.
- On each timeline event (play, seek, sync), finds the latest snapshot whose timestamp is at or before the current playback position.
- Renders the snapshot as a scrollable table sorted by the original capture order.

## Installation

1. Download the latest plugin release.
2. Extract the downloaded `.zip` file.
3. Register the plugin using the plugin interface within Multimodal Observer.
