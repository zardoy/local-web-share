let uploadingProgress
let uploadingFileName

window.onload = () => {
    const websocketUrl = new URL(location.href)
    if (websocketUrl.searchParams.get('uploadSuccess')) {
        message.style.visibility = ''
        message.innerText = `Uploaded successfully ${websocketUrl.searchParams.get('uploadSuccess')}`
    }
    websocketUrl.pathname = 'ws'
    websocketUrl.protocol = 'ws'
    let ws = new WebSocket(websocketUrl)

    ws.onopen = () => {
        console.log('ws connected')
        document.getElementById('connected-full-ui').hidden = false
        document.getElementById('connecting-ui').hidden = true
        document.getElementById('connecting-error').hidden = true
    }

    ws.onmessage = ev => {
        const data = JSON.parse(ev.data)
        if (data.config) {
            document.querySelector('#playPauseButton').hidden = !data.config.remotePlayPauseButton
            document.querySelector('#touchPanel').hidden = !data.config.remoteTouchpad
        }
    }

    ws.onclose = () => {
        console.log('ws closed')
        document.getElementById('connected-full-ui').hidden = true
        document.getElementById('connecting-ui').hidden = false
    }

    ws.onerror = ev => {
        document.getElementById('connecting-error').hidden = false
    }

    let start
    let moved
    touchPanel.addEventListener('pointerdown', event => {
        moved = false
        start = { clientX: event.clientX, clientY: event.clientY, time: Date.now() }
    })
    let last = Date.now()
    let lastMoved = 0
    touchPanel.addEventListener('pointermove', e => {
        if (!start) return
        const data = { x: e.clientX - start.clientX, y: e.clientY - start.clientY }
        if (data.x === 0 && data.y === 0) return
        let d = 4
        data.x /= d
        data.y /= d
        if (Date.now() - last < 5) return
        // if (data.x < 1) data.x = 0
        // if (data.y < 1) data.y = 0
        data.x = Math.round(data.x)
        data.y = Math.round(data.y)
        last = Date.now()
        moved = true
        ws.send(JSON.stringify({ type: 'move', ...data }))
    })
    touchPanel.addEventListener('pointerup', () => {
        if (!moved) {
            console.log('click')
            ws.send(JSON.stringify({ type: 'click', button: Date.now() - start.time > 500 ? 'right' : undefined }))
        }
        start = undefined
    })

    document.querySelector('#upload-file input[type=file]').addEventListener('change', async e => {
        const startTime = Date.now()
        const file = e.target.files[0]
        if (!file) return
        uploadingFileName = file.name
        uploadingProgress = 0
        let uploadedKb = 0
        let uploadedKbPrev = 0
        let uploadingProgressInterval = setInterval(() => {
            document.querySelector('#uploading-state .progress-rate').innerText = `${((uploadedKb - uploadedKbPrev) / 1024).toFixed(1)}mb/s`
            uploadedKbPrev = uploadedKb
        }, 1000)
        document.getElementById('uploading-state').hidden = false
        document.getElementById('upload-file').hidden = true
        const formData = new FormData()
        formData.append('file', file)
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/fileupload')
        xhr.upload.onprogress = e => {
            if (!e.lengthComputable) return
            console.log(e.total)
            uploadingProgress = e.loaded / e.total
            uploadedKb = e.loaded / 1024
            document.querySelector('#uploading-state .progress-current').style.width = `${uploadingProgress}px`
        }
        await new Promise(resolve => {
            xhr.onerror = () => {
                resolve()
                alert('upload failed')
            }
            xhr.onload = () => {
                resolve()
                if (xhr.status === 200) {
                    alert(`Uploaded in ${(Date.now() - startTime) / 1000}s`)
                } else {
                    alert(`upload failed ${xhr.status}`)
                }
            }
            xhr.send(formData)
        })
        clearInterval(uploadingProgressInterval)
        document.getElementById('uploading-state').hidden = true
        document.getElementById('upload-file').hidden = false
        e.target.value = ''
    })
}
