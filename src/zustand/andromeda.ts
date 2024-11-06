'use client'
import { IChainConfigQuery } from '@/graphql';
import { refetchChainConfigQuery } from '@/graphql/queries';
import { apolloClient } from '@andromedaprotocol/andromeda.js';
import type { Window as KeplrWindow } from "@keplr-wallet/types";
import { create } from 'zustand';

declare global {
    interface Window extends KeplrWindow { }
}

interface AndromedaState {
    isConnected: boolean;
    isLoading: boolean;
    keplr: any;
    setIsConnected: (isConnected: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
    setKeplr: (keplr: any) => void;
}

export const useAndromedaStore = create<AndromedaState>((set) => ({
    isConnected: false,
    isLoading: false,
    keplr: null,
    setIsConnected: (isConnected) => set({ isConnected }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setKeplr: (keplr) => set({ keplr }),
}));

const initKeplr = async (chainId: string) => {
    useAndromedaStore.getState().setIsLoading(true);
    const keplr = window.keplr;
    if (!keplr) {
        useAndromedaStore.getState().setIsLoading(false);
        throw new Error('Keplr extension is not installed');
    }

    try {
        const keplrConfig = await apolloClient.query<IChainConfigQuery>(refetchChainConfigQuery({
            'identifier': chainId
        }));

        if (keplrConfig?.data?.keplrConfigs?.config) {
            await keplr.experimentalSuggestChain(keplrConfig.data.keplrConfigs.config);
        } else {
            console.warn('Keplr configuration data is missing');
            await keplr.experimentalSuggestChain({
                chainId: 'galileo-4',
                chainName: 'Andromeda Galileo Testnet',
                rpc: 'https://galileo-4.rpc.andromedaprotocol.io',
                rest: 'https://galileo-4.api.andromedaprotocol.io',
                bip44: {
                    coinType: 118,
                },
                bech32Config: {
                    bech32PrefixAccAddr: 'andr',
                    bech32PrefixAccPub: 'andrpub',
                    bech32PrefixValAddr: 'andrvaloper',
                    bech32PrefixValPub: 'andrvaloperpub',
                    bech32PrefixConsAddr: 'andrvalcons',
                    bech32PrefixConsPub: 'andrvalconspub',
                },
                currencies: [
                    {
                        coinDenom: 'ANDR',
                        coinMinimalDenom: 'uandr',
                        coinDecimals: 6,
                    },
                ],
                feeCurrencies: [
                    {
                        coinDenom: 'ANDR',
                        coinMinimalDenom: 'uandr',
                        coinDecimals: 6,
                    },
                ],
                stakeCurrency: {
                    coinDenom: 'ANDR',
                    coinMinimalDenom: 'uandr',
                    coinDecimals: 6,
                },
                gasPriceStep: {
                    low: 0.01,
                    average: 0.025,
                    high: 0.04,
                },
            });
        }
        useAndromedaStore.getState().setKeplr(keplr);
        useAndromedaStore.getState().setIsConnected(true);
    } catch (error) {
        console.error('Error initializing Keplr:', error);
        throw error;
    } finally {
        useAndromedaStore.getState().setIsLoading(false);
    }
}

export { initKeplr };