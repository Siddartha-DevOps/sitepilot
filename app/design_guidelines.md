{
"brand": {
"name": "SitePilot",
"personality": [
"enterprise-grade",
"field-ready",
"data-dense but calm",
"safety-forward",
"trustworthy",
"fast to scan"
],
"north_star": "Make complex construction operations feel controlled: quick scanning, clear statuses, and one-click actions across RFIs/Submittals/Costs/Safety."
},
"design_foundations": {
"layout_principles": {
"primary_shell": "Desktop: fixed dark sidebar + top utility bar + white content canvas. Mobile: bottom sheet nav or drawer + sticky top bar.",
"reading_flow": "Left-to-right F-pattern: sidebar (tools) → page header (context + actions) → KPI strip → charts → tables.",
"density_rules": [
"Use compact table rows (44–48px) but keep generous section spacing (24–32px).",
"Prefer 2-column layouts on desktop (charts left, activity right).",
"Keep main content background solid white (no transparency).",
"Use slate-tinted surfaces only for sidebar and subtle section headers."
],
"grid": {
"container": "max-w-[1440px] w-full",
"page_padding": "px-4 sm:px-6 lg:px-8",
"section_spacing": "space-y-6 lg:space-y-8",
"kpi_grid": "grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4",
"dashboard_grid": "grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6",
"dashboard_left": "lg:col-span-8",
"dashboard_right": "lg:col-span-4"
}
},
"typography": {
"font_pairing": {
"headings": {
"family": "Space Grotesk",
"google_font": "[https://fonts.google.com/specimen/Space+Grotesk](https://fonts.google.com/specimen/Space+Grotesk)",
"weights": ["500", "600", "700"],
"usage": "Page titles, KPI numbers, module headers"
},
"body": {
"family": "Inter",
"google_font": "[https://fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter)",
"weights": ["400", "500", "600"],
"usage": "Tables, forms, helper text"
},
"mono_optional": {
"family": "IBM Plex Mono",
"google_font": "[https://fonts.google.com/specimen/IBM+Plex+Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)",
"weights": ["400", "500"],
"usage": "IDs (RFI-1024), cost codes, version tags"
}
},
"scale_tailwind": {
"h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
"h2": "text-base md:text-lg font-medium text-slate-600",
"section_title": "text-lg font-semibold text-slate-900",
"kpi_value": "text-2xl lg:text-3xl font-semibold tabular-nums",
"table": "text-sm",
"helper": "text-xs text-slate-500"
},
"numbers": {
"rule": "Use tabular numbers for KPIs and cost values.",
"tailwind": "[font-variant-numeric:tabular-nums]"
}
},
"color_system": {
"constraints": {
"brand_primary_exact": "#F97316",
"brand_slate_exact": "#1E293B",
"main_content_background": "#FFFFFF"
}
}
}
}
