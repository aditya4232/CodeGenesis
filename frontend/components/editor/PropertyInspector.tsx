"use client";

import { useState, useMemo } from "react";

interface PropertyInspectorProps {
    selectedElement?: {
        type: string;
        props: Record<string, any>;
        styles: Record<string, string>;
    };
    onPropsChange?: (props: Record<string, any>) => void;
    onStylesChange?: (styles: Record<string, string>) => void;
}

interface PropertySection {
    title: string;
    properties: PropertyDefinition[];
}

interface PropertyDefinition {
    key: string;
    label: string;
    type: "text" | "number" | "color" | "select" | "boolean" | "spacing";
    options?: string[];
    unit?: string;
}

// Common CSS property definitions
const LAYOUT_PROPERTIES: PropertyDefinition[] = [
    { key: "display", label: "Display", type: "select", options: ["block", "flex", "grid", "inline", "none"] },
    { key: "flexDirection", label: "Direction", type: "select", options: ["row", "column", "row-reverse", "column-reverse"] },
    { key: "justifyContent", label: "Justify", type: "select", options: ["flex-start", "center", "flex-end", "space-between", "space-around"] },
    { key: "alignItems", label: "Align", type: "select", options: ["flex-start", "center", "flex-end", "stretch", "baseline"] },
    { key: "gap", label: "Gap", type: "number", unit: "px" },
];

const SPACING_PROPERTIES: PropertyDefinition[] = [
    { key: "padding", label: "Padding", type: "spacing" },
    { key: "margin", label: "Margin", type: "spacing" },
];

const SIZE_PROPERTIES: PropertyDefinition[] = [
    { key: "width", label: "Width", type: "text" },
    { key: "height", label: "Height", type: "text" },
    { key: "minWidth", label: "Min Width", type: "text" },
    { key: "maxWidth", label: "Max Width", type: "text" },
];

const TYPOGRAPHY_PROPERTIES: PropertyDefinition[] = [
    { key: "fontSize", label: "Font Size", type: "number", unit: "px" },
    { key: "fontWeight", label: "Weight", type: "select", options: ["400", "500", "600", "700", "800"] },
    { key: "color", label: "Color", type: "color" },
    { key: "textAlign", label: "Align", type: "select", options: ["left", "center", "right", "justify"] },
    { key: "lineHeight", label: "Line Height", type: "number" },
];

const BACKGROUND_PROPERTIES: PropertyDefinition[] = [
    { key: "backgroundColor", label: "Background", type: "color" },
    { key: "borderRadius", label: "Radius", type: "number", unit: "px" },
    { key: "borderWidth", label: "Border", type: "number", unit: "px" },
    { key: "borderColor", label: "Border Color", type: "color" },
];

/**
 * PropertyInspector Component
 * 
 * A Figma/VS Code-style property inspector for visual editing.
 */
export function PropertyInspector({
    selectedElement,
    onPropsChange,
    onStylesChange,
}: PropertyInspectorProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(["Layout", "Typography"])
    );

    const sections: PropertySection[] = useMemo(() => [
        { title: "Layout", properties: LAYOUT_PROPERTIES },
        { title: "Spacing", properties: SPACING_PROPERTIES },
        { title: "Size", properties: SIZE_PROPERTIES },
        { title: "Typography", properties: TYPOGRAPHY_PROPERTIES },
        { title: "Background", properties: BACKGROUND_PROPERTIES },
    ], []);

    const toggleSection = (title: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(title)) {
                next.delete(title);
            } else {
                next.add(title);
            }
            return next;
        });
    };

    const handleStyleChange = (key: string, value: string) => {
        if (onStylesChange && selectedElement) {
            onStylesChange({
                ...selectedElement.styles,
                [key]: value,
            });
        }
    };

    if (!selectedElement) {
        return (
            <div className="h-full bg-[#252526] border-l border-white/10 p-4">
                <div className="text-center text-white/30 mt-8">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="text-sm">Select an element to inspect</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-[#252526] border-l border-white/10 overflow-y-auto">
            {/* Header */}
            <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🏷️</span>
                    <span className="text-sm font-medium text-white">
                        {selectedElement.type}
                    </span>
                </div>
            </div>

            {/* Property Sections */}
            <div className="p-2">
                {sections.map((section) => (
                    <div key={section.title} className="mb-2">
                        {/* Section Header */}
                        <button
                            onClick={() => toggleSection(section.title)}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 text-sm text-white/70"
                        >
                            <span>{section.title}</span>
                            <span className="text-xs transform transition-transform"
                                style={{ transform: expandedSections.has(section.title) ? "rotate(90deg)" : "rotate(0)" }}>
                                ▶
                            </span>
                        </button>

                        {/* Section Content */}
                        {expandedSections.has(section.title) && (
                            <div className="mt-1 space-y-2 pl-2">
                                {section.properties.map((prop) => (
                                    <PropertyInput
                                        key={prop.key}
                                        property={prop}
                                        value={selectedElement.styles[prop.key] || ""}
                                        onChange={(value) => handleStyleChange(prop.key, value)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

interface PropertyInputProps {
    property: PropertyDefinition;
    value: string;
    onChange: (value: string) => void;
}

function PropertyInput({ property, value, onChange }: PropertyInputProps) {
    const inputClasses = "w-full bg-[#3c3c3c] border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500";

    return (
        <div className="flex items-center gap-2">
            <label className="text-xs text-white/50 w-20 flex-shrink-0">
                {property.label}
            </label>

            {property.type === "text" && (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClasses}
                />
            )}

            {property.type === "number" && (
                <div className="flex-1 flex items-center gap-1">
                    <input
                        type="number"
                        value={parseInt(value) || 0}
                        onChange={(e) => onChange(`${e.target.value}${property.unit || ""}`)}
                        className={`${inputClasses} w-16`}
                    />
                    {property.unit && (
                        <span className="text-xs text-white/30">{property.unit}</span>
                    )}
                </div>
            )}

            {property.type === "color" && (
                <div className="flex-1 flex items-center gap-2">
                    <input
                        type="color"
                        value={value || "#000000"}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10"
                    />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#000000"
                        className={`${inputClasses} flex-1`}
                    />
                </div>
            )}

            {property.type === "select" && (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClasses}
                >
                    <option value="">—</option>
                    {property.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            )}

            {property.type === "boolean" && (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value === "true"}
                        onChange={(e) => onChange(e.target.checked ? "true" : "false")}
                        className="w-4 h-4 rounded"
                    />
                </label>
            )}

            {property.type === "spacing" && (
                <SpacingInput value={value} onChange={onChange} />
            )}
        </div>
    );
}

function SpacingInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    // Parse spacing (e.g., "10px 20px" or "10px")
    const parts = value.split(" ").map(p => parseInt(p) || 0);
    const top = parts[0] || 0;
    const right = parts[1] ?? top;
    const bottom = parts[2] ?? top;
    const left = parts[3] ?? right;

    const handleChange = (position: number, newValue: number) => {
        const values = [top, right, bottom, left];
        values[position] = newValue;
        onChange(`${values[0]}px ${values[1]}px ${values[2]}px ${values[3]}px`);
    };

    return (
        <div className="flex-1 grid grid-cols-4 gap-1">
            {[top, right, bottom, left].map((v, i) => (
                <input
                    key={i}
                    type="number"
                    value={v}
                    onChange={(e) => handleChange(i, parseInt(e.target.value) || 0)}
                    className="w-full bg-[#3c3c3c] border border-white/10 rounded px-1 py-0.5 text-xs text-white text-center outline-none focus:border-indigo-500"
                    title={["Top", "Right", "Bottom", "Left"][i]}
                />
            ))}
        </div>
    );
}

export default PropertyInspector;
