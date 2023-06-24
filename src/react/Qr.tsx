import { QRCodeCanvas } from 'qrcode.react'

export default ({ value }) => {
    return <QRCodeCanvas size={384} value={value} style={{ border: '1px solid white' }} />
}
