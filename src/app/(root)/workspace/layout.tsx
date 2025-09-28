import { WorkspaceProvider } from '@/app/providers/WorkspaceProvider'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      {children}
    </WorkspaceProvider>
  )
}