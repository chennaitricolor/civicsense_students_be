import Filter from 'bad-words';
import badWords from '../content/badwords';

export default class FilterBadWords {
    private filter;
    constructor() {
        this.filter = new Filter();
        this.loadStaticBadWords();
    }
    public  filterBadWords(data: object) {
        return this.filter.isProfane(data);
    }
    public loadStaticBadWords() {
        return this.filter.addWords(...badWords.words);
    }
}
