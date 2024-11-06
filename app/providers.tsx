'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo, useLayoutEffect } from 'react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { useAndromedaStore, initKeplr } from '@/zustand/andromeda'

interface Props {
    children: React.ReactNode
}

const theme = extendTheme({
    // tema ayarlarınız varsa buraya ekleyin
})

const Providers = (props: Props) => {
    const { children } = props;
    const queryClient = useMemo(() => new QueryClient(), []);
    const isConnected = useAndromedaStore(state => state.isConnected)
    const isLoading = useAndromedaStore(state => state.isLoading)
    const keplr = useAndromedaStore(state => state.keplr)

    useLayoutEffect(() => {
        initKeplr('galileo-4').catch(console.error);
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                {children}
            </ChakraProvider>
        </QueryClientProvider>
    )
}

export default Providers