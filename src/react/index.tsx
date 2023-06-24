/// <reference types="vite/client" />
import { ThemeProvider, createTheme } from '@mui/material'
import { renderToDom } from '@zardoy/react-util'
import Root from './Root'
import './styles.css'

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
})

renderToDom(
    <ThemeProvider theme={theme}>
        <Root />
    </ThemeProvider>,
)
