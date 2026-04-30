import { useTranslation } from "mo-sdk";


export function ProcessesPreview() {
    const { t } = useTranslation("mo-processes_visualization");

    const COLUMNS = [
        t("col.application"),
        t("col.pid"),
        t("col.username"),
        t("col.startInstant"),
        t("col.totalCpuDuration"),
        t("col.parentPid"),
    ];

    const SAMPLE_ROWS = [
        ["node.exe", "1234", "user", "2024-01-01T10:00:00Z", "1520", "980"],
        ["chrome.exe", "5678", "user", "2024-01-01T09:00:00Z", "8430", "1"],
        ["code.exe", "9012", "user", "2024-01-01T10:05:00Z", "3210", "1"],
    ];

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "12px",
                border: "1px dashed #aaa",
                borderRadius: "6px",
                background: "#2a2a2a",
                fontSize: "0.8rem",
                color: "#ccc",
            }}
        >
            <div style={{ fontWeight: 600, color: "#eee", marginBottom: "4px" }}>
                {t("preview.title")}
            </div>
            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.65rem",
                        fontFamily: "monospace",
                        tableLayout: "fixed",
                    }}
                >
                    <thead>
                        <tr style={{ background: "#1a1a1a" }}>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col}
                                    style={{
                                        padding: "3px 6px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #444",
                                        color: "#bbb",
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SAMPLE_ROWS.map((row, i) => (
                            <tr
                                key={i}
                                style={{ background: i % 2 === 0 ? "#222" : "#2a2a2a" }}
                            >
                                {row.map((cell, j) => (
                                    <td
                                        key={j}
                                        style={{
                                            padding: "2px 6px",
                                            borderBottom: "1px solid #333",
                                            color: "#999",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ color: "#777", fontSize: "0.75rem" }}>
                {t("preview.description")}
            </div>
        </div>
    );
}
