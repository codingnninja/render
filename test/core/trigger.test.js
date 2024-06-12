import { $register } from "../../src/render";
describe('Call functions with selected elements and data', function() {

    it('should call any function passed to it', () => {
        function testFunction() {
          return 'test';
        }
        $trigger(testFunction);
        expect(testFunction).toHaveBeenCalled();
    });
    it('should throw error when $trigger is used on the server', () => {
        function testFunction() {
          return 'test';
        }
        expect(() => {
          const a = $trigger(testFunction);
          console.log(a);
        }).toThrow('You can not use $trigger on servers but string is provided in testFunction');
    });
});