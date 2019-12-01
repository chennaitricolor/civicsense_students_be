'use strict';
import { mergeIgnoringUndefined } from '../util/helper';
import Default from './default';

const env = process.env.NODE_ENV;
const importSync = async () => {
    let envConfig;
    const localConfig = await import('./local');
    if (env) {
        try {
            envConfig =  await import(`${'./' + env}`);
        } catch (err) {
            return localConfig.default;
        }
        return mergeIgnoringUndefined(
            Default,
            env ? envConfig.default : localConfig.default
        );
    } else {
        return localConfig.default;
    }
};
export default importSync();