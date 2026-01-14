import { ProxyConfig } from '../types/config';

export const profiles = {
    defaultTUIProfile: {
        "fsEvent": {
            'proxyType': 'local'
        },
        "inference": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        }
    } as ProxyConfig,
    defaultNON_TUIProfile: {
        "fsEvent": {
            'proxyType': 'proxy'
        },
        "inference": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        }
    } as ProxyConfig
};

/**
 * Get the default proxy configuration based on UI mode
 * @param noui - Whether the server is running in no-UI mode
 * @returns ProxyConfig for the appropriate profile
 */
export function getDefaultProxyConfig(noui: boolean = false): ProxyConfig {
    return noui ? profiles.defaultNON_TUIProfile : profiles.defaultTUIProfile;
}