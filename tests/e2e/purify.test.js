import { $purify, stringify } from "../../src/render";

describe('Convert render prop string to equivalent data type', function() {
    it('should correctly convert to bigInt', () => {
        const input = "_9s35Ufa7M67wghwT_&quot;__BigInt__27&quot;_9s35Ufa7M67wghwT_";
        const result = $purify(input);
        expect(result).toBe(27n);
    });

    it('should correctly convert to Date', () => {
        const d = {a:new Date()};
        const expected = {a: d.a.toISOString()};
        const input = stringify(d);
        const result = $purify(input);
        expect(result).toEqual(expected);
    });

    it('should correctly convert to regular expressions', () => {
        const input = "_9s35Ufa7M67wghwT_&quot;__RegExp__&#x2F;\\\\s*\\\\$trigger\\\\s*\\\\(\\\\s*([^,]+)\\\\s*(?:,\\\\s*([^,]+)\\\\s*)?(?:,\\\\s*{\\\\s*([^{}$]+)\\\\s*}\\\\s*)?\\\\s*\\\\)&#x2F;g&quot;_9s35Ufa7M67wghwT_";
        const result = $purify(input);
        expect(result).toStrictEqual(/\s*\$trigger\s*\(\s*([^,]+)\s*(?:,\s*([^,]+)\s*)?(?:,\s*{\s*([^{}$]+)\s*}\s*)?\s*\)/g);
    });

    it('should correctly convert to undefined', () => {
        const input = 'undefined';
        const result = $purify(input);
        expect(result).toBe("");
    });

    it('should correctly convert to a string', () => {
        const input = "_9s35Ufa7M67wghwT_&quot;$render is the best JavaScript framework in the world&quot;_9s35Ufa7M67wghwT_";
        const result = $purify(input);
        expect(result).toBe('$render is the best JavaScript framework in the world');
    });

    it('should correctly convert to Symbol', () => {
        const input = "_9s35Ufa7M67wghwT_&quot;__symbol__Symbol(greatest)&quot;_9s35Ufa7M67wghwT_";
        const result = $purify(input);
        expect(result).toBe(Symbol.for('greatest'));
    });

    it('should correctly convert to an object', () => {
        const input = { key: 'value' };
        const result = $purify(input);
        expect(result).toEqual(input);
    });

    it('should correctly convert to a number', () => {
        const input = '_9s35Ufa7M67wghwT_7_9s35Ufa7M67wghwT_';
        const result = $purify(7);
        expect(result).toEqual(7);
    });

    it('should correctly convert to a Map', () => {
        const input = '_9s35Ufa7M67wghwT_{&quot;dataType&quot;:&quot;Map&quot;,&quot;value&quot;:[]}_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toEqual(new Map());
    });

    it('should correctly convert to a Set', () => {
        const input = '_9s35Ufa7M67wghwT_{&quot;dataType&quot;:&quot;Set&quot;,&quot;value&quot;:[1,3]}_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toEqual(new Set([1,3]));
    });

    it('should correctly convert to a function', () => {
        function myFunction() {
            return new Set([1, 3]);   
        }
        const obj = {
            a: myFunction,
            name: 'Ayo' 
        }

        const input = stringify(obj);
        const result = $purify(input);
        expect(result.a.name).toBe(obj.a.name);
    });

    it('should handle null input correctly', () => {
        const input = '_9s35Ufa7M67wghwT_&quot;null&quot;_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toBe("");
    });

    it('should handle NaN input correctly', () => {
        const input = '_9s35Ufa7M67wghwT_&quot;NaN&quot;_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toBe("");
    });

    it('should handle [object Object] input correctly', () => {
        const input = '_9s35Ufa7M67wghwT_&quot;[object Object]&quot;_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toBe("");
    });

    it('should correctly convert to an array', () => {
        const input = '_9s35Ufa7M67wghwT_&quot;[1, 2, 3]&quot;_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toEqual("[1, 2, 3]");
    });

    it('should return string when input is a non-crude string', () => {
        const input = '_9s35Ufa7M67wghwT_&quot;hello&quot;_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toEqual('hello');
    });
    it('should correctly convert to an object', () => {
        const input = '_9s35Ufa7M67wghwT_{"key": "value"}_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toEqual({ key: 'value' });
    });

    it('should correctly handle undefined in a string of render props', () => {
        const input = '_9s35Ufa7M67wghwT_&quot;__undefined__&quot;_9s35Ufa7M67wghwT_';
        const result = $purify(input);
        expect(result).toBe("");
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