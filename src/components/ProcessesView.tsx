import { useState, useEffect } from "react";
import { useTranslation, type PluginViewProps } from "mo-sdk";

interface ProcessEntry {
    pid: number;
    userName: string;
    startInstant: string;
    totalCpuDuration: number;
    command: string;
    parentPid: number;
    hasChildren: number;
    supportsNormalTermination: number;
}

interface Snapshot {
    captureTimestamp: number;
    processes: ProcessEntry[];
}
function toFileUrl(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    if (/^[a-zA-Z]:/.test(normalized))
        return `file:///${normalized}`;
    return `file://${normalized}`;
}

function appName(command: string | null | undefined): string {
    if (!command)
        return "-";
    const sep = command.includes("\\") ? /\\/ : /\//;
    const parts = command.split(sep);
    return parts[parts.length - 1] || command;
}

interface Column {
    key: string;
    label: string;
    width: string;
}

export function ProcessesView({ controls, context }: PluginViewProps) {
    const { t } = useTranslation("mo-processes_visualization");

    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [current, setCurrent] = useState<Snapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(toFileUrl(context.filePath));
                if (!res.ok)
                    throw new Error("Failed to load processes data");
                const data = (await res.json()) as Snapshot[];
                data.sort((a, b) => a.captureTimestamp - b.captureTimestamp);
                if (!cancelled)
                    setSnapshots(data);
            } catch (err) {
                if (!cancelled)
                    setError(
                        err instanceof Error ? err.message : "Failed to load data"
                    );
            } finally {
                if (!cancelled)
                    setLoading(false);
            }
        }
        void load();
        return () => {
            cancelled = true;
        };
    }, [context.filePath]);
    useEffect(() => {
        function findSnapshot(ts: number): Snapshot | null {
            const absoluteTs = context.fileCaptureStartTimestamp + ts / 1000;
            return snapshots.filter((s) => s.captureTimestamp <= absoluteTs).at(-1) ?? null;
        }

        const unsubs = [
            controls.onPlay((ts) => setCurrent(findSnapshot(ts))),
            controls.onPause(() => {}),
            controls.onSeek((ts) => setCurrent(findSnapshot(ts))),
            controls.onSync((ts) => setCurrent(findSnapshot(ts))),
        ];
        return () => unsubs.forEach((fn) => fn());
    }, [controls, context.fileCaptureStartTimestamp, snapshots]);
    const columns: Column[] = [
        { key: "application", label: t("col.application"),      width: "24%" },
        { key: "pid",         label: t("col.pid"),               width: "8%"  },
        { key: "userName",    label: t("col.username"),          width: "16%" },
        { key: "startInstant",label: t("col.startInstant"),      width: "16%" },
        { key: "totalCpu",    label: t("col.totalCpuDuration"),  width: "16%" },
        { key: "parentPid",   label: t("col.parentPid"),         width: "8%"  },
    ];

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={messageStyle}>{t("loading")}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={{ ...messageStyle, color: "#f88" }}>{error}</div>
            </div>
        );
    }

    const processes = current?.processes ?? [];

    return (
        <div style={containerStyle}>
            <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
                <table style={tableStyle}>
                    <colgroup>
                        {columns.map((col) => (
                            <col key={col.key} style={{ width: col.width }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr style={{ background: "#2a2a2a", position: "sticky", top: 0 }}>
                            {columns.map((col) => (
                                <th key={col.key} style={thStyle}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {processes.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    style={{
                                        padding: "20px",
                                        textAlign: "center",
                                        color: "#777",
                                        fontStyle: "italic",
                                    }}
                                >
                                    {t("noData")}
                                </td>
                            </tr>
                        ) : (
                            processes.map((proc, i) => (
                                <tr
                                    key={proc.pid}
                                    style={{
                                        background: i % 2 === 0 ? "#1a1a1a" : "#222",
                                    }}
                                >
                                    <td style={tdStyle} title={proc.command}>
                                        {appName(proc.command)}
                                    </td>
                                    <td style={tdStyle}>{proc.pid}</td>
                                    <td style={tdStyle}>{proc.userName}</td>
                                    <td style={tdStyle}>{proc.startInstant}</td>
                                    <td style={tdStyle}>{proc.totalCpuDuration}</td>
                                    <td style={tdStyle}>{proc.parentPid}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#1a1a1a",
    color: "#ddd",
    fontFamily: "sans-serif",
    overflow: "hidden",
};

const messageStyle: React.CSSProperties = {
    padding: "20px",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#999",
};

const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.8rem",
    fontFamily: "monospace",
    tableLayout: "fixed",
};

const thStyle: React.CSSProperties = {
    padding: "6px 8px",
    textAlign: "left",
    borderBottom: "1px solid #444",
    color: "#ccc",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const tdStyle: React.CSSProperties = {
    padding: "4px 8px",
    borderBottom: "1px solid #333",
    color: "#ddd",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};
