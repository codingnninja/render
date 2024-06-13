import { $render, $register, stringify } from "../../src/render";
describe('Render a component', function() {
  it('should render a component when the component name starts with an uppercase letter', async () => {
      const component = function MyComponent(props) {
        return `<div>Hello, ${props.name}!</div>`;
      };

      $register(component);
      const props = { name: 'John' };
      const result = await $render(component, props);

      expect(result).toEqual('<div>Hello, John!</div>');
  });

  it('should throw an error when the component name does not start with an uppercase letter', async () => {
      const anotherOne = function noComponent(props) {
        return `<div>Hello, ${props.name}!</div>`;
      };

      $register(anotherOne);
      const props = { name: 'John' };
      const response = await $render(anotherOne, props);
      expect(response).rejects.toThrow(`A component must start with a capital letter in ${globalThis['noComponent']}`);
  });

  it('should render child components', async () => {

    const componentA = function MComponent(props) {
      return `
        <div>Hello, ${props.name}!
          <InnerJSX props={props} />
        </div>
      `;
    };

    const InnerJSX = function MyJSX (props) {
      return `<div>${props.name}</div>`;
    }

    $register(stringify, componentA, InnerJSX);
    const props = { name: 'John' };
    const result = await $render(componentA, props);
console.log(result)
    expect(result).toEqual('<div>Hello, John!</div>');
  });

});