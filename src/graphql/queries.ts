import { gql } from '@apollo/client';

export const refetchChainConfigQuery = (variables: { identifier: string }) => ({
  query: gql`
    query ChainConfig($identifier: String!) {
      keplrConfigs(identifier: $identifier) {
        config
      }
    }
  `,
  variables
});