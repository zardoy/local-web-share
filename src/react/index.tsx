import { ThemeProvider, createTheme } from '@mui/material'
import React, { Suspense } from "react"
import ReactDom from "react-dom"
import Root from './Root'

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
})

// TODO! display loader!
ReactDom.render(<Suspense fallback={null}>
    <ThemeProvider theme={theme}>
        <Root />
    </ThemeProvider>
</Suspense>, document.getElementById("root"))
