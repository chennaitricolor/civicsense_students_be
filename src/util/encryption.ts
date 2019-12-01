import bCrypt from 'bcrypt';

export default class Encryption {

    public static hashPassword(password: string, rounds: number, callback: (error: Error, hash: string) => void): void {
        bCrypt.hash(password, rounds, (error, hash) => {
            callback(error, hash);
        });
    }

    public static async compare(password: string, dbHash: string) {
        return await bCrypt.compare(password, dbHash);
    }
}
