import express from 'express'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { networkInterfaces } from 'systeminformation'

const app = express()
const PORT = process.env.PORT || 55462

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(process.cwd(), 'downloads')
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true })
}

// Get local IP address
const getLocalIp = async () => {
    const _interfaces = await networkInterfaces()
    const interfaces = Array.isArray(_interfaces) ? _interfaces : [_interfaces]
    let netInterface = interfaces.find(int => int.default)
    if (!netInterface) {
        netInterface = interfaces.find(int => !int.virtual) ?? interfaces[0]
        console.warn('Failed to obtain default network interface, searching for fallback')
    }
    if (!netInterface) throw new Error('No network interfaces!')
    return netInterface.ip4
}

// Serve the upload page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Upload</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-size: 2rem;
        }
        .upload-area {
            border: 3px dashed #667eea;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f8f9ff;
        }
        .upload-area:hover {
            border-color: #764ba2;
            background: #f0f2ff;
        }
        .upload-area.dragover {
            border-color: #764ba2;
            background: #e8ebff;
            transform: scale(1.02);
        }
        input[type="file"] {
            display: none;
        }
        .upload-label {
            display: block;
            font-size: 1.2rem;
            color: #667eea;
            cursor: pointer;
            font-weight: 600;
        }
        .upload-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        .upload-text {
            color: #666;
            margin-top: 10px;
            font-size: 0.9rem;
        }
        button {
            width: 100%;
            padding: 15px;
            margin-top: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        button:hover {
            transform: translateY(-2px);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .file-list {
            margin-top: 20px;
            max-height: 200px;
            overflow-y: auto;
        }
        .file-item {
            padding: 10px;
            background: #f8f9ff;
            border-radius: 8px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .file-name {
            color: #333;
            font-weight: 500;
        }
        .file-size {
            color: #666;
            font-size: 0.9rem;
        }
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            margin-top: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.3s ease;
        }
        .message {
            margin-top: 20px;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            font-weight: 500;
        }
        .message.success {
            background: #d4edda;
            color: #155724;
        }
        .message.error {
            background: #f8d7da;
            color: #721c24;
        }
        .server-info {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📤 Upload Files</h1>
        <div class="upload-area" id="uploadArea">
            <div class="upload-icon">📁</div>
            <label for="fileInput" class="upload-label">
                Click to select files or drag and drop
            </label>
            <input type="file" id="fileInput" multiple>
            <div class="upload-text">Multiple files supported</div>
        </div>
        <div id="fileList" class="file-list"></div>
        <button id="uploadBtn" disabled>Upload Files</button>
        <div id="message"></div>
        <div class="server-info">
            Server running on: <strong id="serverUrl"></strong>
        </div>
    </div>
    <script>
        const fileInput = document.getElementById('fileInput')
        const uploadArea = document.getElementById('uploadArea')
        const fileList = document.getElementById('fileList')
        const uploadBtn = document.getElementById('uploadBtn')
        const message = document.getElementById('message')
        const serverUrl = document.getElementById('serverUrl')

        let selectedFiles = []

        // Display server URL
        serverUrl.textContent = window.location.origin

        // File input change
        fileInput.addEventListener('change', (e) => {
            handleFiles(Array.from(e.target.files))
        })

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault()
            uploadArea.classList.add('dragover')
        })

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover')
        })

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault()
            uploadArea.classList.remove('dragover')
            handleFiles(Array.from(e.dataTransfer.files))
        })

        function handleFiles(files) {
            selectedFiles = files
            displayFiles()
            uploadBtn.disabled = files.length === 0
        }

        function displayFiles() {
            fileList.innerHTML = ''
            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div')
                fileItem.className = 'file-item'
                fileItem.innerHTML = \`
                    <div>
                        <div class="file-name">\${file.name}</div>
                        <div class="file-size">\${formatFileSize(file.size)}</div>
                    </div>
                \`
                fileList.appendChild(fileItem)
            })
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes'
            const k = 1024
            const sizes = ['Bytes', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
        }

        uploadBtn.addEventListener('click', async () => {
            if (selectedFiles.length === 0) return

            uploadBtn.disabled = true
            message.innerHTML = ''
            message.className = 'message'

            const formData = new FormData()
            selectedFiles.forEach(file => {
                formData.append('files', file)
            })

            try {
                const xhr = new XMLHttpRequest()

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100
                        // You could add progress bar here if needed
                    }
                }

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText)
                        message.className = 'message success'
                        message.textContent = \`Successfully uploaded \${response.uploaded.length} file(s)!\`
                        selectedFiles = []
                        fileInput.value = ''
                        displayFiles()
                        uploadBtn.disabled = true
                    } else {
                        message.className = 'message error'
                        message.textContent = \`Upload failed: \${xhr.statusText}\`
                        uploadBtn.disabled = false
                    }
                }

                xhr.onerror = () => {
                    message.className = 'message error'
                    message.textContent = 'Upload failed. Please try again.'
                    uploadBtn.disabled = false
                }

                xhr.open('POST', '/upload')
                xhr.send(formData)
            } catch (error) {
                message.className = 'message error'
                message.textContent = 'Upload failed: ' + error.message
                uploadBtn.disabled = false
            }
        })
    </script>
</body>
</html>
    `)
})

// Handle file upload
app.post('/upload', async (req, res) => {
    try {
        const form = formidable({
            uploadDir: downloadsDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB max file size
            multiples: true,
            filename(name, ext, part, form) {
                const originalFilename = part.originalFilename || name + ext
                let filename = originalFilename
                let counter = 0
                const baseName = path.parse(originalFilename).name
                const extension = path.parse(originalFilename).ext

                // Handle duplicate filenames
                while (fs.existsSync(path.join(downloadsDir, filename))) {
                    counter++
                    filename = `${baseName} (${counter})${extension}`
                }
                return filename
            },
        })

        const [fields, files] = await form.parse(req)

        // Handle formidable file structure - files can be an array or single file object
        let fileArray: any[] = []
        if (files.files) {
            fileArray = Array.isArray(files.files) ? files.files : [files.files]
        }

        const uploaded = fileArray.map(file => ({
            filename: file.originalFilename || path.basename(file.filepath) || 'unknown',
            size: file.size || 0,
            path: file.filepath,
        }))

        res.json({
            success: true,
            uploaded: uploaded,
            message: `Successfully uploaded ${uploaded.length} file(s)`,
        })
    } catch (error: any) {
        console.error('Upload error:', error)
        res.status(500).json({
            success: false,
            error: error.message || 'Upload failed',
        })
    }
})

// Start server
const startServer = async () => {
    const server = app.listen(PORT, '0.0.0.0', async () => {
        const localIp = await getLocalIp()
        console.log(`\n🚀 Server is running!`)
        console.log(`📱 Local:   http://localhost:${PORT}`)
        console.log(`🌐 Network: http://${localIp}:${PORT}`)
        console.log(`📁 Files will be saved to: ${downloadsDir}`)
        console.log(`\nPress Ctrl+C to stop the server\n`)
    })

    server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please use a different port.`)
            process.exit(1)
        } else {
            console.error('Server error:', err)
            process.exit(1)
        }
    })
}

startServer().catch(console.error)
