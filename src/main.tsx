import { PlaybackPlugin, type PluginViewProps } from "mo-sdk";
import { ProcessesView } from "./components/ProcessesView.js";
import { ProcessesPreview } from "./components/ProcessesPreview.js";

export default class ProcessesVisualizationPlugin extends PlaybackPlugin {
    getView(props: PluginViewProps) {
        return <ProcessesView {...props} />;
    }
    getPreview() {
        return <ProcessesPreview />;
    }
    validExtensions() {
        return ["json"];
    }
    validateCaptureDescriptor(descriptor: Record<string, unknown> | null): boolean {
        return descriptor?.["format"] === "processes_snapshot_array";
    }
}
