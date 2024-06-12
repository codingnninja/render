import { stringify } from "../../src/render";

describe('Convert data type to render prop string', function() {

    it('should correctly serialize a number', () => {
        const input = 2;
        const result = stringify(input);
        expect(result).toBe('_9s35Ufa7M67wghwT_2_9s35Ufa7M67wghwT_');
    });

    it('should correctly serialize a plain object', () => {
        const input = { key: 'value' };
        const result = stringify(input);
        expect(result).toBe('_9s35Ufa7M67wghwT_{&quot;key&quot;:&quot;value&quot;}_9s35Ufa7M67wghwT_');
    });

    it('should correctly serialize a Map object', () => {
        const input = new Map();
        const result = stringify(input);
        expect(result).toBe('_9s35Ufa7M67wghwT_{&quot;dataType&quot;:&quot;Map&quot;,&quot;value&quot;:[]}_9s35Ufa7M67wghwT_');
    });

    it('should correctly serialize a Set', () => {
        const input = new Set([1,3]);
        const result = stringify(input);
        expect(result).toBe('_9s35Ufa7M67wghwT_{&quot;dataType&quot;:&quot;Set&quot;,&quot;value&quot;:[1,3]}_9s35Ufa7M67wghwT_');
    });

    it('should correctly serialize a function', () => {
        const input = () => new Set([1,3]);
        const result = stringify(input);
        expect(result).toBe('_9s35Ufa7M67wghwT_&quot;__function__:function input() {      return new Set([1, 3]);    }&quot;_9s35Ufa7M67wghwT_');
    });

    it('should handle empty objects', () => {
        const input = {};
        const result = stringify(input);
        expect(result).toBe('_9s35Ufa7M67wghwT_{}_9s35Ufa7M67wghwT_');
    });

    it('should correctly handle nested arrays', () => {
        const input = [{ key: ['value1', 'value2'] }];
        const result = stringify(input);
        expect(result).toBe('_9s35Ufa7M67wghwT_[{&quot;key&quot;:[&quot;value1&quot;,&quot;value2&quot;]}]_9s35Ufa7M67wghwT_');
    });

    it('should correctly serialize an array of objects', () => {
        const input = [{ key: 'value' }, { key: 'another value' }];
        const result = stringify(input);
        expect(result).toBe('_9s35Ufa7M67wghwT_[{&quot;key&quot;:&quot;value&quot;},{&quot;key&quot;:&quot;another value&quot;}]_9s35Ufa7M67wghwT_');
    });
});