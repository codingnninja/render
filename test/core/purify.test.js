import { $purify } from "../../src/render";
describe('Convert render prop string to equivalent data type', function() {
    it('should return object when input is an object', () => {
        const input = { key: 'value' };
        const result = $purify(input);
        expect(result).toEqual(input);
    });

    it('should return number when input is a number', () => {
        const input = '_9s35Ufa7M67wghwT_7_9s35Ufa7M67wghwT_';
        const result = $purify(7);
        expect(result).toEqual(7);
    });

    it('should return Map when crude input is a Map', () => {
        const input = '_9s35Ufa7M67wghwT_{&quot;dataType&quot;:&quot;Map&quot;,&quot;value&quot;:[]}_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toEqual(new Map());
    });

    it('should return Set when input is a Set', () => {
        const input = '_9s35Ufa7M67wghwT_{&quot;dataType&quot;:&quot;Set&quot;,&quot;value&quot;:[1,3]}_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toEqual(new Set([1,3]));
    });

    it('should return function when input is a function', () => {
        const input = '_9s35Ufa7M67wghwT_&quot;__function__:function myFunction() {      return new Set([1, 3]);    }&quot;_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result.name).toEqual('myFunction');
    });

    it('should handle null input correctly', () => {
        const input = null;
        const result = $purify(input);
        expect(result).toBeNull();
    });

    it('should return array when input is an array', () => {
        const input = [1, 2, 3];
        const result = $purify(input);
        expect(result).toEqual(input);
    });

    it('should return string when input is a non-crude string', () => {
        const input = 'hello';
        const result = $purify(input);
        expect(result).toEqual(input);
    });
    it('should convert crude string to equivalent data type using convertToPropSystem', () => {
        const input = '_9s35Ufa7M67wghwT_{"key": "value"}_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toEqual({ key: 'value' });
    });

    it('should return undefined when input is undefined', () => {
        const input = undefined;
        const result = $purify(input);
        expect(result).toBeUndefined();
    });

    it('should return input string when it contains render special characters', () => {
        const input = 'special_string_9s35Ufa7M67wghwT_special';
        const result = $purify(input);
        expect(result).toEqual(input);
    });

    it('should log error when JSON parsing fails (for invalid JSON)', () => {
        const input = '_9s35Ufa7M67wghwT_invalid_JSON_9s35Ufa7M67wghwT_';
        console.error = jest.fn();
        $purify(input);
        expect(console.error).toHaveBeenCalled();
    });
});