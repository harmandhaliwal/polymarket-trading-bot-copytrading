import { ENV } from '../config/env';
import { createPolymarketProxyClobClient } from '../utils/polymarketClobClient';
import type { ClobClient } from '@polymarket/clob-client-v2';

const PROXY_WALLET = ENV.PROXY_WALLET;
const PRIVATE_KEY = ENV.PRIVATE_KEY;
const CLOB_HTTP_URL = ENV.CLOB_HTTP_URL;
const RPC_URL = ENV.RPC_URL;

const createClobClient = async (): Promise<ClobClient> => {
    const clobClient = await createPolymarketProxyClobClient({
        host: CLOB_HTTP_URL as string,
        privateKey: PRIVATE_KEY as string,
        rpcUrl: RPC_URL as string,
        proxyWallet: PROXY_WALLET as string,
        consoleMuteDuringAuth: 'errors-only',
    });
    console.log(clobClient);
    return clobClient;
};

export default createClobClient;
