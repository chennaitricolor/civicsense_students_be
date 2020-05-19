class RangeValidator {
    private matchers: RegExpExecArray | null;
    constructor(range: string) {
        const rangeEx = /^(\(|\[)([\d]+),([\d]+)(\)|\])$/;
        this.matchers = rangeEx.exec(range);
    }

    public validate(value: number): boolean {
        const matchers = this.matchers;
        if (matchers) {
            const lowNumber = parseInt(matchers[2], 10);
            const highNumber = parseInt(matchers[3], 10);
            const low = matchers[1] === '[' ? lowNumber : lowNumber - 1;
            const high = matchers[4] === ']' ? highNumber : highNumber - 1;
            return low <= value && value <= high;
        }
        return false;
    }
}
export const validations = {
    isPositiveCaseValidators: {
        'Oxygen Level' : (ol: number): boolean => new RangeValidator('[94, 98]').validate(ol),
        'Pulse' : (pulse: number): boolean => new RangeValidator('[72, 80]').validate(pulse),
        'Temperature' : (temperature: number): boolean => new RangeValidator('[98, 99]').validate(temperature),
        'Respiratory Rate' : (respiratorRate: number): boolean => new RangeValidator('[16, 20]').validate(respiratorRate),
    }
};