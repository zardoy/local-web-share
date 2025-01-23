import { QRCodeCanvas } from 'qrcode.react'

export default ({ value }) => {
    return (
        <div>
            <div style={{ marginBottom: 15, fontSize: 20 }}>{value}</div>
            <QRCodeCanvas size={384} value={value} style={{ border: '1px solid white' }} />
        </div>
    )
}
