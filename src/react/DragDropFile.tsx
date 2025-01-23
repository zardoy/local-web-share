// src/react/DragDropFile.tsx
import { useEffect } from 'react'
import { typedIpcRenderer } from 'typed-ipc'

export default function DragDropFile() {
    useEffect(() => {
        const handleDrop = (event: DragEvent) => {
            event.preventDefault()
            const files = event.dataTransfer?.files
            if (files && files.length > 0) {
                const filePath = files[0]!.path
                console.log('filePath', filePath)
                typedIpcRenderer.send('openFile', { path: filePath })
            }
        }

        const handleDragOver = (event: DragEvent) => {
            event.preventDefault()
        }

        window.addEventListener('drop', handleDrop)
        window.addEventListener('dragover', handleDragOver)

        return () => {
            window.removeEventListener('drop', handleDrop)
            window.removeEventListener('dragover', handleDragOver)
        }
    }, [])

    return <div></div>
}
