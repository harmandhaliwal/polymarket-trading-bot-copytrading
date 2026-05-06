/** Verifies Polymarket CLOB v2 client; re-add full sell workflow when stable. */
import createClobClient from '../utils/createClobClient';
(async () => {
    try {
        console.log('CLOB OK:', await (await createClobClient()).getOk());
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
