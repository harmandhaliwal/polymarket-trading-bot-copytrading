import { ClobClient, SignatureTypeV2 } from '@polymarket/clob-client-v2';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';

const POLYGON_CHAIN_ID = 137;

export type PolymarketWalletMode = 'gnosis_safe' | 'eoa';

export type ConsoleMuteDuringAuth = 'none' | 'all' | 'errors-only';

export type CreatePolymarketClobClientOptions = {
    host: string;
    privateKey: string;
    rpcUrl: string;
    proxyWallet: string;
    /** Mute console while calling createOrDeriveApiKey (library may log). */
    consoleMuteDuringAuth?: ConsoleMuteDuringAuth;
    onWalletDetected?: (mode: PolymarketWalletMode) => void;
};

export type CreatePolymarketProxyClobClientOptions = {
    host: string;
    privateKey: string;
    rpcUrl: string;
    proxyWallet: string;
    consoleMuteDuringAuth?: ConsoleMuteDuringAuth;
};

function normalizePrivateKey(key: string): `0x${string}` {
    const trimmed = key.trim();
    const hex = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
    return hex as `0x${string}`;
}

async function withConsoleMute<T>(
    mode: ConsoleMuteDuringAuth | undefined,
    fn: () => Promise<T>
): Promise<T> {
    const effective = mode ?? 'none';
    if (effective === 'none') {
        return fn();
    }
    const log = console.log;
    const err = console.error;
    if (effective === 'all') {
        console.log = () => {};
        console.error = () => {};
    } else {
        console.error = () => {};
    }
    try {
        return await fn();
    } finally {
        console.log = log;
        console.error = err;
    }
}

/**
 * CLOB client for the common case: signer EOA in .env, optional Gnosis Safe proxy as funder.
 * Matches Polymarket docs: signature types 0 (EOA) vs 2 (GNOSIS_SAFE) and correct funderAddress.
 */
export async function createPolymarketClobClient(
    options: CreatePolymarketClobClientOptions
): Promise<ClobClient> {
    const {
        host,
        privateKey,
        rpcUrl,
        proxyWallet,
        consoleMuteDuringAuth,
        onWalletDetected,
    } = options;

    const account = privateKeyToAccount(normalizePrivateKey(privateKey));

    const transport = http(rpcUrl);
    const publicClient = createPublicClient({ chain: polygon, transport });
    const code = await publicClient.getCode({ address: proxyWallet as `0x${string}` });
    const isGnosisSafe = code !== undefined && code !== '0x';

    onWalletDetected?.(isGnosisSafe ? 'gnosis_safe' : 'eoa');

    const signatureType = isGnosisSafe
        ? SignatureTypeV2.POLY_GNOSIS_SAFE
        : SignatureTypeV2.EOA;
    const funderAddress = (isGnosisSafe ? proxyWallet : account.address) as string;

    const signer = createWalletClient({
        account,
        chain: polygon,
        transport,
    });

    const creds = await withConsoleMute(consoleMuteDuringAuth, () =>
        new ClobClient({ host, chain: POLYGON_CHAIN_ID, signer }).createOrDeriveApiKey()
    );

    return new ClobClient({
        host,
        chain: POLYGON_CHAIN_ID,
        signer,
        creds,
        signatureType,
        funderAddress,
    });
}

/**
 * Magic Link / email Polymarket accounts: POLY_PROXY (1) with proxy wallet as funder.
 */
export async function createPolymarketProxyClobClient(
    options: CreatePolymarketProxyClobClientOptions
): Promise<ClobClient> {
    const { host, privateKey, rpcUrl, proxyWallet, consoleMuteDuringAuth } = options;
    const account = privateKeyToAccount(normalizePrivateKey(privateKey));
    const transport = http(rpcUrl);
    const signer = createWalletClient({
        account,
        chain: polygon,
        transport,
    });

    const creds = await withConsoleMute(consoleMuteDuringAuth, () =>
        new ClobClient({ host, chain: POLYGON_CHAIN_ID, signer }).createOrDeriveApiKey()
    );

    return new ClobClient({
        host,
        chain: POLYGON_CHAIN_ID,
        signer,
        creds,
        signatureType: SignatureTypeV2.POLY_PROXY,
        funderAddress: proxyWallet,
    });
}
