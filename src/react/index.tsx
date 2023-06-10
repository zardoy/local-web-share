import { ThemeProvider, createTheme } from '@mui/material'
import { Suspense } from 'react'
import { renderToDom } from '@zardoy/react-util'
import Root from './Root'

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
})

// TODO! display loader!
renderToDom(
    <Suspense fallback={null}>
        <ThemeProvider theme={theme}>
            <Root />
        </ThemeProvider>
    </Suspense>,
)
