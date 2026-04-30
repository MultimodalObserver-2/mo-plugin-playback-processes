import { reactExports, jsxRuntimeExports } from "react";
import { useTranslation, PlaybackPlugin } from "mo-sdk";
const useState = reactExports.useState;
const useEffect = reactExports.useEffect;
const jsx$2 = jsxRuntimeExports.jsx;
const jsxs$1 = jsxRuntimeExports.jsxs;
function toFileUrl(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (/^[a-zA-Z]:/.test(normalized)) return `file:///${normalized}`;
  return `file://${normalized}`;
}
function appName(command) {
  if (!command) return "-";
  const sep = command.includes("\\") ? /\\/ : /\//;
  const parts = command.split(sep);
  return parts[parts.length - 1] || command;
}
function ProcessesView({
  controls,
  context
}) {
  const {
    t
  } = useTranslation("mo-processes_visualization");
  const [snapshots, setSnapshots] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(toFileUrl(context.filePath));
        if (!res.ok) throw new Error("Failed to load processes data");
        const data = await res.json();
        data.sort((a, b) => a.captureTimestamp - b.captureTimestamp);
        if (!cancelled) setSnapshots(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [context.filePath]);
  useEffect(() => {
    function findSnapshot(ts) {
      const absoluteTs = context.fileCaptureStartTimestamp + ts / 1e3;
      return snapshots.filter((s) => s.captureTimestamp <= absoluteTs).at(-1) ?? null;
    }
    const unsubs = [controls.onPlay((ts) => setCurrent(findSnapshot(ts))), controls.onPause(() => {
    }), controls.onSeek((ts) => setCurrent(findSnapshot(ts))), controls.onSync((ts) => setCurrent(findSnapshot(ts)))];
    return () => unsubs.forEach((fn) => fn());
  }, [controls, context.fileCaptureStartTimestamp, snapshots]);
  const columns = [{
    key: "application",
    label: t("col.application"),
    width: "24%"
  }, {
    key: "pid",
    label: t("col.pid"),
    width: "8%"
  }, {
    key: "userName",
    label: t("col.username"),
    width: "16%"
  }, {
    key: "startInstant",
    label: t("col.startInstant"),
    width: "16%"
  }, {
    key: "totalCpu",
    label: t("col.totalCpuDuration"),
    width: "16%"
  }, {
    key: "parentPid",
    label: t("col.parentPid"),
    width: "8%"
  }];
  if (loading) {
    return /* @__PURE__ */ jsx$2("div", {
      style: containerStyle,
      children: /* @__PURE__ */ jsx$2("div", {
        style: messageStyle,
        children: t("loading")
      })
    });
  }
  if (error) {
    return /* @__PURE__ */ jsx$2("div", {
      style: containerStyle,
      children: /* @__PURE__ */ jsx$2("div", {
        style: {
          ...messageStyle,
          color: "#f88"
        },
        children: error
      })
    });
  }
  const processes = current?.processes ?? [];
  return /* @__PURE__ */ jsx$2("div", {
    style: containerStyle,
    children: /* @__PURE__ */ jsx$2("div", {
      style: {
        overflowY: "auto",
        flex: 1,
        minHeight: 0
      },
      children: /* @__PURE__ */ jsxs$1("table", {
        style: tableStyle,
        children: [/* @__PURE__ */ jsx$2("colgroup", {
          children: columns.map((col) => /* @__PURE__ */ jsx$2("col", {
            style: {
              width: col.width
            }
          }, col.key))
        }), /* @__PURE__ */ jsx$2("thead", {
          children: /* @__PURE__ */ jsx$2("tr", {
            style: {
              background: "#2a2a2a",
              position: "sticky",
              top: 0
            },
            children: columns.map((col) => /* @__PURE__ */ jsx$2("th", {
              style: thStyle,
              children: col.label
            }, col.key))
          })
        }), /* @__PURE__ */ jsx$2("tbody", {
          children: processes.length === 0 ? /* @__PURE__ */ jsx$2("tr", {
            children: /* @__PURE__ */ jsx$2("td", {
              colSpan: columns.length,
              style: {
                padding: "20px",
                textAlign: "center",
                color: "#777",
                fontStyle: "italic"
              },
              children: t("noData")
            })
          }) : processes.map((proc, i) => /* @__PURE__ */ jsxs$1("tr", {
            style: {
              background: i % 2 === 0 ? "#1a1a1a" : "#222"
            },
            children: [/* @__PURE__ */ jsx$2("td", {
              style: tdStyle,
              title: proc.command,
              children: appName(proc.command)
            }), /* @__PURE__ */ jsx$2("td", {
              style: tdStyle,
              children: proc.pid
            }), /* @__PURE__ */ jsx$2("td", {
              style: tdStyle,
              children: proc.userName
            }), /* @__PURE__ */ jsx$2("td", {
              style: tdStyle,
              children: proc.startInstant
            }), /* @__PURE__ */ jsx$2("td", {
              style: tdStyle,
              children: proc.totalCpuDuration
            }), /* @__PURE__ */ jsx$2("td", {
              style: tdStyle,
              children: proc.parentPid
            })]
          }, proc.pid))
        })]
      })
    })
  });
}
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  background: "#1a1a1a",
  color: "#ddd",
  fontFamily: "sans-serif",
  overflow: "hidden"
};
const messageStyle = {
  padding: "20px",
  textAlign: "center",
  fontSize: "0.9rem",
  color: "#999"
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.8rem",
  fontFamily: "monospace",
  tableLayout: "fixed"
};
const thStyle = {
  padding: "6px 8px",
  textAlign: "left",
  borderBottom: "1px solid #444",
  color: "#ccc",
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};
const tdStyle = {
  padding: "4px 8px",
  borderBottom: "1px solid #333",
  color: "#ddd",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
const jsx$1 = jsxRuntimeExports.jsx;
const jsxs = jsxRuntimeExports.jsxs;
function ProcessesPreview() {
  const {
    t
  } = useTranslation("mo-processes_visualization");
  const COLUMNS = [t("col.application"), t("col.pid"), t("col.username"), t("col.startInstant"), t("col.totalCpuDuration"), t("col.parentPid")];
  const SAMPLE_ROWS = [["node.exe", "1234", "user", "2024-01-01T10:00:00Z", "1520", "980"], ["chrome.exe", "5678", "user", "2024-01-01T09:00:00Z", "8430", "1"], ["code.exe", "9012", "user", "2024-01-01T10:05:00Z", "3210", "1"]];
  return /* @__PURE__ */ jsxs("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      padding: "12px",
      border: "1px dashed #aaa",
      borderRadius: "6px",
      background: "#2a2a2a",
      fontSize: "0.8rem",
      color: "#ccc"
    },
    children: [/* @__PURE__ */ jsx$1("div", {
      style: {
        fontWeight: 600,
        color: "#eee",
        marginBottom: "4px"
      },
      children: t("preview.title")
    }), /* @__PURE__ */ jsx$1("div", {
      style: {
        overflowX: "auto"
      },
      children: /* @__PURE__ */ jsxs("table", {
        style: {
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.65rem",
          fontFamily: "monospace",
          tableLayout: "fixed"
        },
        children: [/* @__PURE__ */ jsx$1("thead", {
          children: /* @__PURE__ */ jsx$1("tr", {
            style: {
              background: "#1a1a1a"
            },
            children: COLUMNS.map((col) => /* @__PURE__ */ jsx$1("th", {
              style: {
                padding: "3px 6px",
                textAlign: "left",
                borderBottom: "1px solid #444",
                color: "#bbb",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              },
              children: col
            }, col))
          })
        }), /* @__PURE__ */ jsx$1("tbody", {
          children: SAMPLE_ROWS.map((row, i) => /* @__PURE__ */ jsx$1("tr", {
            style: {
              background: i % 2 === 0 ? "#222" : "#2a2a2a"
            },
            children: row.map((cell, j) => /* @__PURE__ */ jsx$1("td", {
              style: {
                padding: "2px 6px",
                borderBottom: "1px solid #333",
                color: "#999",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              },
              children: cell
            }, j))
          }, i))
        })]
      })
    }), /* @__PURE__ */ jsx$1("div", {
      style: {
        color: "#777",
        fontSize: "0.75rem"
      },
      children: t("preview.description")
    })]
  });
}
const jsx = jsxRuntimeExports.jsx;
class ProcessesVisualizationPlugin extends PlaybackPlugin {
  getView(props) {
    return /* @__PURE__ */ jsx(ProcessesView, {
      ...props
    });
  }
  getPreview() {
    return /* @__PURE__ */ jsx(ProcessesPreview, {});
  }
  validExtensions() {
    return ["json"];
  }
  validateCaptureDescriptor(descriptor) {
    return descriptor?.["format"] === "processes_snapshot_array";
  }
}
export {
  ProcessesVisualizationPlugin as default
};
