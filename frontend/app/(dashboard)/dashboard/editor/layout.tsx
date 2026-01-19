export default function EditorLayout({ children }: { children: React.ReactNode }) {
    // Editor has its own fullscreen layout - no sidebar, no search bar
    return <>{children}</>
}
